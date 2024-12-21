// components/Neko.js
"use client";
import React from "react";
import { useEffect, useRef } from "react";

const Neko = ({ spriteUrl = "/oneko.gif" }) => {
    const nekoRef = useRef(null);
    const animationFrameRef = useRef(null);
    const lastFrameTimestampRef = useRef(null);

    const stateRef = useRef({
        nekoPosX: 32,
        nekoPosY: 32,
        mousePosX: 0,
        mousePosY: 0,
        frameCount: 0,
        idleTime: 0,
        idleAnimation: null,
        idleAnimationFrame: 0,
        isReducedMotion: false,
    });

    const spriteSets = {
        idle: [[-3, -3]],
        alert: [[-7, -3]],
        scratchSelf: [
            [-5, 0],
            [-6, 0],
            [-7, 0],
        ],
        scratchWallN: [
            [0, 0],
            [0, -1],
        ],
        scratchWallS: [
            [-7, -1],
            [-6, -2],
        ],
        scratchWallE: [
            [-2, -2],
            [-2, -3],
        ],
        scratchWallW: [
            [-4, 0],
            [-4, -1],
        ],
        tired: [[-3, -2]],
        sleeping: [
            [-2, 0],
            [-2, -1],
        ],
        N: [
            [-1, -2],
            [-1, -3],
        ],
        NE: [
            [0, -2],
            [0, -3],
        ],
        E: [
            [-3, 0],
            [-3, -1],
        ],
        SE: [
            [-5, -1],
            [-5, -2],
        ],
        S: [
            [-6, -3],
            [-7, -2],
        ],
        SW: [
            [-5, -3],
            [-6, -1],
        ],
        W: [
            [-4, -2],
            [-4, -3],
        ],
        NW: [
            [-1, 0],
            [-1, -1],
        ],
    };

    useEffect(() => {
        // Check for prefers-reduced-motion
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        stateRef.current.isReducedMotion =
            mediaQuery.matches || mediaQuery === true;

        if (stateRef.current.isReducedMotion) return;

        const nekoEl = nekoRef.current;

        // Initial styles
        Object.assign(nekoEl.style, {
            width: "32px",
            height: "32px",
            position: "fixed",
            pointerEvents: "none",
            imageRendering: "pixelated",
            left: `${stateRef.current.nekoPosX - 16}px`,
            top: `${stateRef.current.nekoPosY - 16}px`,
            zIndex: "2147483647",
            backgroundImage: `url(${spriteUrl})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0px 0px",
        });

        // Mouse move handler
        const handleMouseMove = (event) => {
            stateRef.current.mousePosX = event.clientX;
            stateRef.current.mousePosY = event.clientY;
        };

        document.addEventListener("mousemove", handleMouseMove);

        // Animation loop
        const onAnimationFrame = (timestamp) => {
            if (!lastFrameTimestampRef.current) {
                lastFrameTimestampRef.current = timestamp;
            }

            if (timestamp - lastFrameTimestampRef.current > 100) {
                lastFrameTimestampRef.current = timestamp;
                frame(nekoEl);
            }

            animationFrameRef.current = window.requestAnimationFrame(onAnimationFrame);
        };

        animationFrameRef.current = window.requestAnimationFrame(onAnimationFrame);

        return () => {
            // Cleanup
            document.removeEventListener("mousemove", handleMouseMove);
            if (animationFrameRef.current) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spriteUrl]);

    const setSprite = (nekoEl, name, frame) => {
        const sprite = spriteSets[name][frame % spriteSets[name].length];
        nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
    };

    const resetIdleAnimation = () => {
        stateRef.current.idleAnimation = null;
        stateRef.current.idleAnimationFrame = 0;
    };

    const idle = (nekoEl) => {
        stateRef.current.idleTime += 1;

        // every ~ 20 seconds (assuming frame called every 100ms)
        if (
            stateRef.current.idleTime > 10 &&
            Math.floor(Math.random() * 200) === 0 &&
            stateRef.current.idleAnimation == null
        ) {
            let availableIdleAnimations = ["sleeping", "scratchSelf"];
            const { nekoPosX, nekoPosY } = stateRef.current;

            if (nekoPosX < 32) {
                availableIdleAnimations.push("scratchWallW");
            }
            if (nekoPosY < 32) {
                availableIdleAnimations.push("scratchWallN");
            }
            if (nekoPosX > window.innerWidth - 32) {
                availableIdleAnimations.push("scratchWallE");
            }
            if (nekoPosY > window.innerHeight - 32) {
                availableIdleAnimations.push("scratchWallS");
            }

            const randomIndex = Math.floor(
                Math.random() * availableIdleAnimations.length
            );
            stateRef.current.idleAnimation =
                availableIdleAnimations[randomIndex];
        }

        switch (stateRef.current.idleAnimation) {
            case "sleeping":
                if (stateRef.current.idleAnimationFrame < 8) {
                    setSprite(nekoEl, "tired", 0);
                    break;
                }
                setSprite(
                    nekoEl,
                    "sleeping",
                    Math.floor(stateRef.current.idleAnimationFrame / 4)
                );
                if (stateRef.current.idleAnimationFrame > 192) {
                    resetIdleAnimation();
                }
                break;
            case "scratchWallN":
            case "scratchWallS":
            case "scratchWallE":
            case "scratchWallW":
            case "scratchSelf":
                setSprite(nekoEl, stateRef.current.idleAnimation, stateRef.current.idleAnimationFrame);
                if (stateRef.current.idleAnimationFrame > 9) {
                    resetIdleAnimation();
                }
                break;
            default:
                setSprite(nekoEl, "idle", 0);
                return;
        }
        stateRef.current.idleAnimationFrame += 1;
    };

    const frame = (nekoEl) => {
        stateRef.current.frameCount += 1;
        const { nekoPosX, nekoPosY, mousePosX, mousePosY } = stateRef.current;
        const diffX = nekoPosX - mousePosX;
        const diffY = nekoPosY - mousePosY;
        const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
        const nekoSpeed = 10;

        if (distance < nekoSpeed || distance < 48) {
            idle(nekoEl);
            return;
        }

        stateRef.current.idleAnimation = null;
        stateRef.current.idleAnimationFrame = 0;

        if (stateRef.current.idleTime > 1) {
            setSprite(nekoEl, "alert", 0);
            // count down after being alerted before moving
            stateRef.current.idleTime = Math.min(stateRef.current.idleTime, 7);
            stateRef.current.idleTime -= 1;
            return;
        }

        let direction = "";
        if (diffY / distance > 0.5) direction += "N";
        if (diffY / distance < -0.5) direction += "S";
        if (diffX / distance > 0.5) direction += "W";
        if (diffX / distance < -0.5) direction += "E";

        setSprite(nekoEl, direction || "idle", stateRef.current.frameCount);

        stateRef.current.nekoPosX -= (diffX / distance) * nekoSpeed;
        stateRef.current.nekoPosY -= (diffY / distance) * nekoSpeed;

        // Clamp positions
        stateRef.current.nekoPosX = Math.min(
            Math.max(16, stateRef.current.nekoPosX),
            window.innerWidth - 16
        );
        stateRef.current.nekoPosY = Math.min(
            Math.max(16, stateRef.current.nekoPosY),
            window.innerHeight - 16
        );

        // Update styles
        nekoEl.style.left = `${stateRef.current.nekoPosX - 16}px`;
        nekoEl.style.top = `${stateRef.current.nekoPosY - 16}px`;
    };

    // If prefers-reduced-motion is enabled, don't render the neko
    const [shouldRender, setShouldRender] = React.useState(true);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setShouldRender(!mediaQuery.matches);

        const handleChange = (event) => {
            setShouldRender(!event.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    if (!shouldRender) return null;

    return <div id="oneko" ref={nekoRef} aria-hidden="true" />;
};

export default Neko;
