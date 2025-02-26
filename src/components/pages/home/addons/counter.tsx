// @vlaxcs - contact if bugs
import React, { useState, useRef, useEffect } from "react";
import { TFunction } from "next-i18next";

interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CounterProps {
  t: TFunction;
}

const Counter: React.FC<CounterProps> = ({ t }) => {
  const Ref = useRef<NodeJS.Timeout | null>(null);

  // Function to set the deadline: 10:00, 04.03.2025 (Cariere v14)
  const getDeadline = (): Date => {
    const deadline = new Date();
    deadline.setSeconds(0);
    deadline.setMinutes(0);
    deadline.setHours(10);
    deadline.setDate(4);
    deadline.setMonth(2); // March is month 2 (0-indexed)
    deadline.setFullYear(2025);
    return deadline;
  };

  // Get the current time
  const getCurrentTime = (): Date => {
    return new Date();
  };

  // Calculate remaining time
  const getTimeRemaining = (
    deadline: Date,
    currentTime: Date,
  ): TimeRemaining => {
    const total =
      Date.parse(deadline.toString()) - Date.parse(currentTime.toString());
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  };

  // State for the timer for each component of data
  const deadline = getDeadline();
  const { total, days, hours, minutes, seconds } = getTimeRemaining(
    deadline,
    getCurrentTime(),
  );
  var counting = total > 0 ? true : false;
  const [secondsTimer, setSecondsTimer] = useState<string>("");
  const [minutesTimer, setMinutesTimer] = useState<string>("");
  const [hoursTimer, setHoursTimer] = useState<string>("");
  const [daysTimer, setDaysTimer] = useState<string>("");

  // Function to start the timer
  const startTimer = (deadline: Date) => {
    const { total, days, hours, minutes, seconds } = getTimeRemaining(
      deadline,
      getCurrentTime(),
    );
    if (total >= 0) {
      setSecondsTimer(String(seconds));
      setMinutesTimer(String(minutes));
      setHoursTimer(String(hours));
      setDaysTimer(String(days));
    } else {
      counting = false;
    }
  };

  // Function to clear and restart the timer
  const clearTimer = (deadline: Date) => {
    const { total, days, hours, minutes, seconds } = getTimeRemaining(
      deadline,
      getCurrentTime(),
    );
    if (total >= 0) {
      setSecondsTimer(String(seconds));
      setMinutesTimer(String(minutes));
      setHoursTimer(String(hours));
      setDaysTimer(String(days));
    } else {
      counting = false;
    }

    if (Ref.current) clearInterval(Ref.current);

    // Start the countdown using setInterval
    const id = setInterval(() => {
      startTimer(deadline);
    }, 1000);

    Ref.current = id;
  };

  useEffect(() => {
    clearTimer(deadline);

    return () => {
      if (Ref.current) clearInterval(Ref.current);
    };
  }, []);

  return (
    // Do not modify anything here | This code checks where and when the comma and the separator should be placed
    <div style={{ textAlign: "center", margin: "auto" }}>
      {counting ? (
        <p className="mt-12 font-display text-white text-xl sm:text-2xl">
          {t("counter.main")}
          {daysTimer !== "0" &&
            (parseInt(daysTimer) > 1
              ? ` ${daysTimer} 
                ${parseInt(daysTimer) >= 20 ? `${t("counter.rosep")} ` : ""} 
                ${t("counter.days")}`
              : ` ${t("counter.singleDay")}`)}
          {hoursTimer !== "0" &&
            (parseInt(hoursTimer) > 1
              ? `${daysTimer !== "0" ? ", " : ""} 
              ${hoursTimer}
              ${parseInt(hoursTimer) >= 20 ? `${t("counter.rosep")} ` : ""} ${t(
                "counter.hours",
              )}`
              : `${daysTimer !== "0" ? ", " : ""} 
              ${t("counter.singleHour")}`)}
          {minutesTimer !== "0" &&
            (parseInt(minutesTimer) > 1
              ? `${
                  daysTimer !== "0" || hoursTimer !== "0"
                    ? secondsTimer === "0"
                      ? ` ${t("counter.separator")}`
                      : ", "
                    : ""
                } 
              ${minutesTimer}
              ${parseInt(minutesTimer) >= 20 ? `${t("counter.rosep")} ` : ""} 
              ${t("counter.minutes")}`
              : `${
                  daysTimer !== "0" || hoursTimer !== "0"
                    ? daysTimer !== "0" ||
                      (hoursTimer !== "0" && secondsTimer === "0")
                      ? ` ${t("counter.separator")}`
                      : ", "
                    : ""
                } 
              ${t("counter.singleMinute")}`)}
          {secondsTimer !== "0" &&
            (parseInt(secondsTimer) > 1
              ? `${
                  daysTimer !== "0" ||
                  hoursTimer !== "0" ||
                  minutesTimer !== "0"
                    ? daysTimer !== "0" ||
                      hoursTimer !== "0" ||
                      minutesTimer !== "0"
                      ? ` ${t("counter.separator")}`
                      : ", "
                    : ""
                } 
              ${secondsTimer}
              ${
                parseInt(secondsTimer) >= 20 ? `${t("counter.rosep")} ` : ""
              } ${t("counter.seconds")}`
              : `${
                  daysTimer !== "0" ||
                  hoursTimer !== "0" ||
                  minutesTimer !== "0"
                    ? daysTimer !== "0" ||
                      hoursTimer !== "0" ||
                      minutesTimer !== "0"
                      ? ` ${t("counter.separator")}`
                      : ", "
                    : ""
                } 
              ${t("counter.singleSecond")}`)}
          !
        </p>
      ) : (
        <p className="mt-12 font-display text-3xl font-medium italic text-white">
          {t("counter.started")}
        </p>
      )}
    </div>
  );
};

export default Counter;

/*
Unformatted

import React, { useState, useRef, useEffect } from "react";
import { TFunction } from "next-i18next";

interface TimeRemaining {
  total: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface DaysRemaining {
  days: number;
}

interface CounterProps{
  t: TFunction
}

const Counter: React.FC<CounterProps> = ({t}) => {
  const Ref = useRef<NodeJS.Timeout | null>(null);

  // Function to set the deadline: 10:00, 04.03.2025 (Cariere v14)
  const getDeadline = (): Date => {
    const deadline = new Date();
    deadline.setSeconds(0);
    deadline.setMinutes(0);
    deadline.setHours(10);
    deadline.setDate(4);
    deadline.setMonth(2); // March is month 2 (0-indexed)
    deadline.setFullYear(2025);
    return deadline;
  };

  // Get the current time
  const getCurrentTime = (): Date => {
    return new Date();
  };

  // Compute remaining days
  const getDaysRemaining = (deadline: Date, currentTime: Date): DaysRemaining => {
    const total = Date.parse(deadline.toString()) - Date.parse(currentTime.toString());
    const days = Math.floor(total / (1000 * 60 * 60 * 24)); // Calculate the number of days
    return {
      days
    };
  };

  // Calculate remaining time
  const getTimeRemaining = (deadline: Date, currentTime: Date): TimeRemaining => {
    const total = Date.parse(deadline.toString()) - Date.parse(currentTime.toString());
    const days = Math.floor(total / (1000 * 60 * 60 * 24)); // Calculate the number of days
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    return {
      total,
      hours,
      minutes,
      seconds,
    };
  };
  
  // State for the timer, it is a string formatted as "dd:hh:mm:ss"
  const deadline = getDeadline();
  const { total, hours, minutes, seconds } = getTimeRemaining(deadline, getCurrentTime());
  const counting = total > 0 ? true : false;
  const daysRemaining = getDaysRemaining(deadline, getCurrentTime());
  const daysUntil = daysRemaining.days === 0 ? false : true;
  const [timer, setTimer] = useState<string>("");

  // Function to start the timer
  const startTimer = (deadline: Date) => {
    const { total, hours, minutes, seconds } = getTimeRemaining(deadline, getCurrentTime());
    if (total >= 0) {
      // Format the time and update the state
      setTimer(
        (hours > 9 ? hours : "0" + hours) + ":" +
        (minutes > 9 ? minutes : "0" + minutes) + ":" +
        (seconds > 9 ? seconds : "0" + seconds)
      );
    }
  };

  // Function to clear and restart the timer
  const clearTimer = (deadline: Date) => {
    // Clear the existing interval and reset the timer
    const { total, hours, minutes, seconds } = getTimeRemaining(deadline, getCurrentTime());
    if (total >= 0) {
      // Format the time and update the state
      setTimer(
        (hours > 9 ? hours : "0" + hours) + ":" +
        (minutes > 9 ? minutes : "0" + minutes) + ":" +
        (seconds > 9 ? seconds : "0" + seconds)
      );
    }
    if (Ref.current) clearInterval(Ref.current);

    // Start the countdown using setInterval
    const id = setInterval(() => {
      startTimer(deadline);
    }, 1000);

    Ref.current = id;
  };

  useEffect(() => {
    clearTimer(deadline);

    return () => {
      if (Ref.current) clearInterval(Ref.current);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", margin: "auto" }}>
      {counting ? (
      daysRemaining.days > 1 ? (
      <p className="mt-12 font-display text-2xl text-white font-montserrat">
        {t("counter.main")} {daysRemaining.days} {t("counter.days")} {t("counter.separator")} {timer}!
      </p>
      ) : daysRemaining.days === 1 ? (
        <p className="mt-12 font-display text-2xl text-white font-montserrat">
          {t("counter.main")} {t("counter.singleDay")} {t("counter.separator")} {timer}!
        </p>
        ) : (
        <p className="mt-12 font-display text-2xl text-white font-montserrat">
          {t("counter.main")} {timer}!
        </p>
        )
      ) : (
      <p className="mt-12 font-display text-2xl text-white font-montserrat">
        {t("counter.started")}
      </p>
      )}
    </div>
  );
};

export default Counter;
*/
