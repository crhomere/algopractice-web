"use client";
import dynamic from "next/dynamic";

export const CodeEditor = dynamic(() => import("@monaco-editor/react").then(m => m.default), { ssr: false });
