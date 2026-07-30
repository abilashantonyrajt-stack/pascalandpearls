"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({ endTime }: { endTime: number }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, endTime - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (remaining <= 0) return <span className="text-xs text-red-500">Sale Ended</span>;

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <span className="text-xs text-red-500">
      {days}d {hours}h {minutes}m {seconds}s
    </span>
  );
}
