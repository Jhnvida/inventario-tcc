export const MOTION_TOKENS = {
    duration: {
        fast: 150,
        normal: 200,
        moderate: 280,
        slow: 400,
    },
    easing: {
        standard: "cubic-bezier(0.16, 1, 0.3, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    transitions: {
        interactive: "transition-all duration-150 ease-out",
        colors: "transition-colors duration-150 ease-out",
        transform: "transition-transform duration-150 ease-out",
        panel: "transition-all duration-280 ease-[cubic-bezier(0.16,1,0.3,1)]",
        opacity: "transition-opacity duration-280 ease-out",
    },
} as const;

export type MotionTokens = typeof MOTION_TOKENS;
