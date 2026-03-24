"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Webcam from "react-webcam";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/useUser";
import { Camera, CheckCircle2, User, Mail, ShieldAlert, Loader2 } from "lucide-react";

// For hackathon purposes, we use a constant password for biometric accounts 
// so we can seamlessly sign them into Supabase Auth after face matching.
const BIOMETRIC_DUMMY_PASSWORD = "FaceAuthDemo2026!";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const mode = searchParams.get("mode") || "login"; // 'login' or 'register'

  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Loading facial recognition models...");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      // Fetch full name from profile
      const fetchProfile = async () => {
        const supabase = createClient();
        const { data } = await supabase.from("profiles").select("name").eq("id", user.id).single();
        if (data?.name) setName(data.name);
      };
      fetchProfile();
    }
  }, [user]);

  // Store faceapi instance
  const [faceapi, setFaceapi] = useState<any>(null);

  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        const loadedFaceApi = await import("@vladmandic/face-api");
        setFaceapi(loadedFaceApi);
        
        await Promise.all([
          loadedFaceApi.nets.tinyFaceDetector.loadFromUri("/models"),
          loadedFaceApi.nets.faceLandmark68Net.loadFromUri("/models"),
          loadedFaceApi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
        setStatusMsg("Models loaded. Ready for scan.");
      } catch (e) {
        console.error("Error loading models", e);
        setStatusMsg("Error loading facial models. Please refresh.");
      }
    };
    loadFaceApi();
  }, []);

  const getFaceDescriptor = async (): Promise<Float32Array | null> => {
    if (!webcamRef.current?.video || !faceapi) return null;
    const video = webcamRef.current.video;
    
    // Ensure video is playing and has dimensions
    if (video.readyState !== 4) return null;

    // Lower default threshold from 0.5 -> 0.3 for easier webcam detection
    const options = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 });

    const detections = await faceapi
      .detectSingleFace(video, options)
      .withFaceLandmarks()
      .withFaceDescriptor();
      
    return detections ? detections.descriptor : null;
  };

  // --- AUTO-CAPTURE LOOP ---
  useEffect(() => {
    let isActive = true;

    const performAutoScan = async () => {
      if (!isScanning || !isActive) return;

      try {
        const descriptor = await getFaceDescriptor();
        
        if (descriptor && isScanning && isActive) {
          // FACE DETECTED SUCCESSFULLY!
          setIsScanning(false);
          
          const base64Avatar = webcamRef.current?.getScreenshot();
          if (base64Avatar) {
            setCapturedImage(base64Avatar);
          }
          
          if (mode === "register") {
            await processRegistration(descriptor, base64Avatar);
          } else {
            await processLogin(descriptor);
          }
          return; // Stop scanning sequence
        }
      } catch (err) {
        console.warn("Detection loop error:", err);
      }

      // If no face found or errored, loop again after slight delay sequentially
      if (isActive && isScanning) {
        setTimeout(performAutoScan, 400); 
      }
    };

    if (isScanning) {
      performAutoScan();
    }

    return () => {
      isActive = false;
    };
  }, [isScanning, mode]);

  // --- BUTTON CLICK HANDLER (Starts Scanning) ---
  const handleStartScan = () => {
    if (mode === "register" && (!email || !name)) {
      alert("Please enter both Name and Email to register.");
      return;
    }
    if (mode === "login" && !email) {
      alert("Please enter the email associated with your account.");
      return;
    }
    setIsProcessing(true);
    setIsScanning(true);
    setStatusMsg("Scanning for a clear face... Please look directly at the camera.");
  };

  // --- REGISTRATION LOGIC ---
  const processRegistration = async (descriptor: Float32Array, base64Avatar?: string | null) => {
    setStatusMsg(user ? "Face captured! Updating profile..." : "Face captured! Creating account...");
    try {
      const supabase = createClient();
      let targetUserId = user?.id;

      // If they are NOT officially logged in, we check if the email exists in profiles FIRST
      if (!targetUserId) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, face_descriptor")
          .eq("email", email)
          .single();

        if (existingProfile) {
          if (existingProfile.face_descriptor) {
             throw new Error("This account already has a face registered! Please login, or contact an Admin to request a re-verify.");
          }
          targetUserId = existingProfile.id;
        } else {
          // Completely new user!
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: BIOMETRIC_DUMMY_PASSWORD,
            options: { data: { name, role: 'patient' } }
          });

          if (authError) throw new Error("Could not create account: " + authError.message);
          if (!authData.user) throw new Error("Unknown error creating account.");
          targetUserId = authData.user.id;
        }
      } else {
        // User IS logged in, verify they don't already have a face mapped
        const { data: activeProfile } = await supabase
          .from("profiles")
          .select("face_descriptor")
          .eq("id", targetUserId)
          .single();
          
        if (activeProfile?.face_descriptor) {
          throw new Error("Your face is already mapped! It cannot be changed unless an Admin requests a re-verify.");
        }
      }

      // Prepare biometric data
      const descArray = Array.from(descriptor);
      const updateData: any = { face_descriptor: descArray };
      if (base64Avatar) updateData.avatar_base64 = base64Avatar;

      // Update the user's profile with face data
      const { error: profileError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", targetUserId);
        
      if (profileError) throw new Error("Failed to save biometric data: " + profileError.message);

      setStatusMsg("Registration Complete! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);

    } catch (e: any) {
      console.error(e);
      setStatusMsg(e.message || "An error occurred during registration.");
      setIsProcessing(false);
    }
  };

  // --- LOGIN LOGIC ---
  const processLogin = async (currentDescriptor: Float32Array) => {
    setStatusMsg("Face captured! Verifying identity...");
    try {
      const supabase = createClient();
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, face_descriptor")
        .eq("email", email)
        .single();

      if (error || !profile?.face_descriptor) {
        throw new Error("No biometric profile found for this email. Please register first.");
      }
      
      const registeredDescriptor = new Float32Array(profile.face_descriptor);
      const distance = faceapi.euclideanDistance(registeredDescriptor, currentDescriptor);
      
      if (distance > 0.45) {
        throw new Error("Facial verification failed. Match distance too high.");
      }

      if (mode !== "2fa") {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: BIOMETRIC_DUMMY_PASSWORD
        });

        if (loginError) {
          throw new Error("Supabase auth failed. You may not have registered via the biometric portal.");
        }
      }

      setTimeout(() => router.push("/dashboard"), 1000);

    } catch (e: any) {
      console.error(e);
      setStatusMsg(e.message || "An error occurred during verification.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 pt-24">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 bg-slate-900 text-white text-center">
          <Camera className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
          <h1 className="text-2xl font-bold tracking-tight">Biometric Portal</h1>
          <p className="text-slate-400 text-sm mt-1">
            {mode === "register" ? "Map your face to create an account" : 
             mode === "2fa" ? "2-Step Verification: Scan your face" : "Scan your face to access your dashboard"}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          
          <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video shadow-inner flex items-center justify-center">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured Face" className="w-full h-full object-cover" />
            ) : (
              <>
                {!modelsLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-sm font-medium">Initializing Neural Net...</span>
                  </div>
                )}
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${modelsLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Overlay Frame */}
                <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-xl pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-40 border-2 border-emerald-500/50 rounded-[40px] border-dashed pointer-events-none" />
                </div>
              </>
            )}
          </div>

          {/* Auto-fill inputs if logged in, else require manual entry */}
          {!user ? (
            <div className="space-y-4">
              {mode === "register" && (
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Full Legal Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-center">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Logged in as {name || email}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Your face will be securely mapped to this profile.
              </p>
            </div>
          )}

          <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-3 ${
            statusMsg.includes("Error") || statusMsg.includes("failed") || statusMsg.includes("No face")
              ? "bg-red-50 text-red-700 border border-red-200"
              : statusMsg.includes("Complete") || statusMsg.includes("successful")
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}>
            {statusMsg.includes("Error") || statusMsg.includes("failed") || statusMsg.includes("No face") 
              ? <ShieldAlert className="w-5 h-5 shrink-0" />
              : <CheckCircle2 className="w-5 h-5 shrink-0" />
            }
            <span className="leading-snug">{statusMsg}</span>
          </div>

          <button
            onClick={handleStartScan}
            disabled={!modelsLoaded || isScanning || (isProcessing && !isScanning)}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isScanning && <Loader2 className="w-5 h-5 animate-spin" />}
            {isScanning ? "Scanning Camera..." : (mode === "register" ? "Register Face ID" : mode === "2fa" ? "Verify 2nd Step" : "Verify & Login")}
          </button>
        </div>
        
        {/* Footer Toggle */}
        {mode !== "2fa" && (
          <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {mode === "register" ? "Already mapped your face?" : "Don't have a Face ID yet?"}
            </p>
            <button 
              type="button"
              onClick={() => router.push(`/verify?mode=${mode === 'register' ? 'login' : 'register'}`)}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              {mode === "register" ? "Go to Login" : "Register a New Face"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
