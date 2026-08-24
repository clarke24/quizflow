"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRDisplayProps {
  url: string;
  code: string;
}

export function QRDisplay({ url, code }: QRDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
        <QRCodeSVG value={url} size={200} level="M" includeMargin />
      </div>
      <div className="text-center">
        <p className="text-sm text-slate-500 mb-1">Or enter code</p>
        <p className="text-3xl font-mono font-bold tracking-[0.3em] text-indigo-600">
          {code}
        </p>
      </div>
    </div>
  );
}
