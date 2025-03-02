import React, { useEffect } from "react";
import Granim from "granim";

interface GradientBackgroundProps {
  cvid: string;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ cvid }) => {
  useEffect(() => {
    requestAnimationFrame(() => {
      const element = document.getElementById(cvid);

      if (element) {
        if (element instanceof HTMLCanvasElement) {
          new Granim({
            element: element,
            direction: "diagonal",
            states: {
              "default-state": {
                gradients: [
                  ["#005a34", "#021710"],
                  ["#004022", "#012a1d"],
                  ["#012a1d", "#005a34"],
                ],
                transitionSpeed: 3333,
              },
            },
          });
        } else {
          console.error("Element is not a canvas element.");
        }
      } else {
        console.error("Element with id 'background' not found.");
      }
    });
  }, []);

  return null;
};

export default GradientBackground;
