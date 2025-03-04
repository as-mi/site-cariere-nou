import { useEffect, useState } from "react";

interface CountdownProps {
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  running: boolean;
  setRunning: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Countdown({
  time,
  setTime,
  running,
  setRunning,
}: CountdownProps) {
  useEffect(() => {
    const interval = setTimeout(() => {
      if (time > 0 && running) {
        setTime((time) => time - 1);
      } else {
        setRunning(false);
      }
    }, 1000);

    return () => {
      clearTimeout(interval);
    };
  });

  return (
    <>
      <p>{`Time Remaining: ${time}`}</p>
    </>
  );
}
