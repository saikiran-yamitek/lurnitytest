// src/components/IntroVideo.js
import React, { useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

export default function IntroVideo() {
  const videoRef = useRef(null);
  const hist = useHistory();

  useEffect(() => {
    const video = videoRef.current;
    video.play();

    video.onended = () => {
      hist.replace("/home");
    };
  }, [hist]);

  return (
    <div style={{ background: "black", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <video
        ref={videoRef}
        src="/lurnity_intro.mp4"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
        preload="auto"
      />
    </div>
  );
}
