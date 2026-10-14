import { Heart, Music2, Play, Sparkles } from "lucide-react";

export function OrbitArt() {
  return (
    <div className="orbit-art" aria-hidden="true">
      <div className="orbit-ring" />
      <span className="orbit-core"><Sparkles size={32} strokeWidth={1.6} /></span>
      <span className="orbit-satellite"><Music2 size={25} /></span>
      <span className="orbit-satellite"><Heart size={25} /></span>
      <span className="orbit-satellite"><Play size={25} /></span>
    </div>
  );
}
