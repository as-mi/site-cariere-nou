import Granim from "granim";
import React, { useEffect } from "react";

const GradientBackground: React.FC = () => {
  useEffect(() => {
    new Granim({
      element: "#background",
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
  }, []);

  return (
    <canvas
      style={{ opacity: 0.777 }}
      id="background"
      aria-hidden="true"
      className="absolute z-1 w-full h-full top-0 left-0"
    />
  );
};

export default GradientBackground;
