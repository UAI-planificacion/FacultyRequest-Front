"use client";

import { useId } from "react";

export function CheckIcon() {
    const maskId = useId();

    return (
        <svg
            className="mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
        >
            <mask id={maskId}>
                <g
                    fill="none"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                >
                    <path
                        fill="#fff"
                        fillOpacity="0"
                        strokeDasharray="64"
                        strokeDashoffset="64"
                        d="M4 12v-7c0 -0.55 0.45 -1 1 -1h14c0.55 0 1 0.45 1 1v14c0 0.55 -0.45 1 -1 1h-14c-0.55 0 -1 -0.45 -1 -1Z"
                    >
                        <animate
                            fill="freeze"
                            attributeName="fill-opacity"
                            begin="0.6s"
                            dur="0.5s"
                            values="0;1"
                        />

                        <animate
                            fill="freeze"
                            attributeName="stroke-dashoffset"
                            dur="0.6s"
                            values="64;0"
                        />
                    </path>

                    <path
                        stroke="#000"
                        strokeDasharray="14"
                        strokeDashoffset="14"
                        d="M8 12l3 3l5 -5"
                    >
                        <animate
                            fill="freeze"
                            attributeName="stroke-dashoffset"
                            begin="1.1s"
                            dur="0.2s"
                            values="14;0"
                        />
                    </path>
                </g>
            </mask>

            <rect
                width="24"
                height="24"
                fill="currentColor"
                mask={`url(#${maskId})`}
            />
        </svg>
    );
}
