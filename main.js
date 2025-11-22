document.addEventListener("DOMContentLoaded", () => {
  // Preload crumple images so they don't flash blank on first use
  const crumpleStageUrls = [
    "./paper_stage1.png",
    "./paper_stage2.png",
    "./paper_stage3.png",
    "./paper.png",
  ];

  crumpleStageUrls.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  // Year in footer (optional)
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  const projectsTrigger = document.getElementById("projects-trigger");
  const contactTrigger = document.getElementById("contact-trigger");
  const resumeTrigger = document.getElementById("resume-trigger");
  const body = document.body;

  if (projectsTrigger && contactTrigger) {
    const targetHref =
      projectsTrigger.getAttribute("data-href") ||
      projectsTrigger.getAttribute("href") ||
      "#projects";

    projectsTrigger.addEventListener("click", (event) => {
      event.preventDefault();

      // Avoid spamming animation
      if (body.classList.contains("is-project-shot-running")) {
        return;
      }
      body.classList.add("is-project-shot-running");

      // Get button positions in the viewport BEFORE hiding them
      const paperRect = projectsTrigger.getBoundingClientRect();
      const netRect = contactTrigger.getBoundingClientRect();
      const resumeRect = resumeTrigger
        ? resumeTrigger.getBoundingClientRect()
        : null;

      // Hide actual buttons immediately so you don't see them under the overlay
      projectsTrigger.classList.add("is-hidden-for-shot");
      contactTrigger.classList.add("is-hidden-for-shot");
      if (resumeTrigger) {
        resumeTrigger.classList.add("is-hidden-for-shot");
        resumeTrigger.classList.add("is-morphing-to-scoreboard");
      }

      // Visually morph the contact button into the net
      contactTrigger.classList.add("is-morphing-to-net");

      // Create overlays
      const paper = document.createElement("div");
      paper.className = "shot-paper";

      const net = document.createElement("div");
      net.className = "shot-net";

      let scoreboard = null;
      if (resumeRect) {
        scoreboard = document.createElement("div");
        scoreboard.className = "shot-scoreboard";
      }

      // Make sure paper is above net
      paper.style.zIndex = "10002";
      net.style.zIndex = "10001";

      // Start both at their respective button centers
      const startX = paperRect.left + paperRect.width / 2;
      const startY = paperRect.top + paperRect.height / 2;
      const endX = netRect.left + netRect.width / 2;
      const endY = netRect.top + netRect.height / 2;

      // Position overlays
      paper.style.left = `${startX}px`;
      paper.style.top = `${startY}px`;
      net.style.left = `${endX}px`;
      net.style.top = `${endY}px`;

      let scoreStartX, scoreStartY, scoreEndX, scoreEndY;

      if (scoreboard && resumeRect) {
        scoreStartX = resumeRect.left + resumeRect.width / 2;
        scoreStartY = resumeRect.top + resumeRect.height / 2;

        // Final position: above the net
        scoreEndX = endX;
        scoreEndY = endY - 90; // px above net

        scoreboard.style.left = `${scoreStartX}px`;
        scoreboard.style.top = `${scoreStartY}px`;
      }

      document.body.appendChild(net);
      document.body.appendChild(paper);
      if (scoreboard) {
        document.body.appendChild(scoreboard);
      }

      // Make the net / scoreboard pop in slightly
      requestAnimationFrame(() => {
        net.classList.add("is-visible");
        if (scoreboard) {
          scoreboard.classList.add("is-visible");
        }
      });

      // ---- Use the real button as the first “flat” stage ----
      // Match size + background to the original button
      const btnStyles = window.getComputedStyle(projectsTrigger);
      paper.style.width = `${paperRect.width}px`;
      paper.style.height = `${paperRect.height}px`;
      paper.style.borderRadius = btnStyles.borderRadius;
      paper.style.background = btnStyles.background; // same gradient as button
      paper.style.backgroundImage = "none"; // we'll set PNGs later
      paper.style.backgroundSize = "cover";
      paper.style.backgroundRepeat = "no-repeat";
      paper.style.backgroundPosition = "center";

      // ====== CRUMPLE STAGES (smooth, no flicker) ======
      const crumpleStages = [
        "url('./paper_stage1.png')",
        "url('./paper_stage2.png')",
        "url('./paper_stage3.png')",
        "url('./paper.png')", // final crumpled ball
      ];

      let stageIndex = 0;
      const stageDuration = 200; // ms per frame

      function runCrumpleStage() {
        paper.style.backgroundImage = crumpleStages[stageIndex];
        paper.style.backgroundRepeat = "no-repeat";
        paper.style.backgroundPosition = "center";

        // Make stage1 + stage2 bigger, keep stage3 + paper.png as-is-ish
        if (stageIndex === 0) {
          paper.style.backgroundSize = "150% auto";
        } else if (stageIndex === 1) {
          paper.style.backgroundSize = "130% auto";
        } else if (stageIndex === 2) {
          paper.style.backgroundSize = "50% auto";
        } else {
          paper.style.backgroundSize = "contain";
        }

        if (stageIndex < crumpleStages.length - 1) {
          stageIndex += 1;
          setTimeout(runCrumpleStage, stageDuration);
        } else {
          startShot();
        }
      }

      // ====== PARABOLIC SHOT + FALL THROUGH NET ======
      function startShot() {
        const duration = 700; // ms for the shot
        const peakHeight = 180; // arc height (px)
        const startTime = performance.now();

        function animate(time) {
          const elapsed = time - startTime;
          const t = Math.min(elapsed / duration, 1); // 0..1

          // Linear interpolation for x and baseline y
          const x = startX + (endX - startX) * t;
          const baseY = startY + (endY - startY) * t;

          // Parabolic arc
          const arcOffset = peakHeight * 4 * t * (1 - t);
          const y = baseY - arcOffset;

          paper.style.left = `${x}px`;
          paper.style.top = `${y}px`;

          if (scoreboard) {
            const sx = scoreStartX + (scoreEndX - scoreStartX) * t;
            const sy = scoreStartY + (scoreEndY - scoreStartY) * t;
            scoreboard.style.left = `${sx}px`;
            scoreboard.style.top = `${sy}px`;
          }

          const rotation = 720 * t; // 2 spins across the flight
          paper.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            // Hit the net: tiny pop
            net.classList.add("is-scored");

            // Fall straight down and fade out
            const fallDistance = 75;
            const fallDuration = 350;
            const fallStartY = endY;
            const fallStartTime = performance.now();

            function fallStep(now) {
              const elapsedFall = now - fallStartTime;
              const tf = Math.min(elapsedFall / fallDuration, 1);

              const currentY = fallStartY + fallDistance * tf;
              paper.style.top = `${currentY}px`;
              paper.style.opacity = String(1 - tf);

              if (tf < 1) {
                requestAnimationFrame(fallStep);
              } else {
                // Done: cleanup + navigate
                paper.remove();
                net.remove();
                if (scoreboard) {
                  scoreboard.remove();
                }

                projectsTrigger.classList.remove("is-hidden-for-shot");
                contactTrigger.classList.remove("is-hidden-for-shot");
                if (resumeTrigger) {
                  resumeTrigger.classList.remove("is-hidden-for-shot");
                  resumeTrigger.classList.remove("is-morphing-to-scoreboard");
                }
                contactTrigger.classList.remove("is-morphing-to-net");
                body.classList.remove("is-project-shot-running");

                // Navigate to target (same-page anchor in this demo)
                window.location.href = targetHref;
              }
            }

            requestAnimationFrame(fallStep);
          }
        }

        requestAnimationFrame(animate);
      }

      // Let the user see the button morph for a moment, then start crumple
      setTimeout(runCrumpleStage, 120);
    });
  }
});
