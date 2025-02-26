import React, { useEffect } from "react";
import Granim from "granim";

const GradientBackground: React.FC = () => {
  useEffect(() => {
    requestAnimationFrame(() => {
      const element = document.getElementById("background");

      if (element) {
        if (element instanceof HTMLCanvasElement) {
          new Granim({
            element: element,
            direction: "diagonal",
            states: {
              "default-state": {
                gradients: [
                  ["#007e47", "#032117"],
                  ["#005b34", "#01432a"],
                  ["#01432a", "#007e47"],
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
