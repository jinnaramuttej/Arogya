import { memo } from "react";

interface DoctorAvatarProps {
  isSpeaking: boolean;
}

const DoctorAvatar = memo(function DoctorAvatar({ isSpeaking }: DoctorAvatarProps) {
  // isSpeaking is not currently supported by the Spline iframe embed,
  // but we keep the prop for compatibility with parent components.
  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden relative">
      <iframe 
        src='https://my.spline.design/nexbotrobotcharacterconcept-l4QXavLeCVfK9Z5fQaTToS9H/' 
        frameBorder='0' 
        width='100%' 
        height='100%'
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
});

export default DoctorAvatar;
