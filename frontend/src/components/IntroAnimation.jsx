import { useEffect } from "react";
import "./IntroAnimation.css";

function IntroAnimation({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="intro-screen">
      <div className="intro-content">
        <div className="intro-logo">i</div>
        <h1>iMOVIES</h1>
        <p>YOUR NEXT MOVIE NIGHT STARTS HERE</p>
        <div className="intro-loader">
          <span />
        </div>
      </div>
    </div>
  );
}

export default IntroAnimation;