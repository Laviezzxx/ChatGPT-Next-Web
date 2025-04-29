"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./WeatherSelector.module.scss";

export type WeatherType = "rain" | "snow" | "clouds" | "clear";

interface WeatherSelectorProps {
  currentWeather: WeatherType;
  onWeatherChange: (weather: WeatherType) => void;
}

export const WeatherSelector = ({
  currentWeather,
  onWeatherChange,
}: WeatherSelectorProps) => {
  const [isRotating, setIsRotating] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [hoverState, setHoverState] = useState<WeatherType | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  // 天气类型对应的角度
  const weatherAngles: Record<WeatherType, number> = {
    rain: 0,
    snow: 90,
    clouds: 180,
    clear: 270,
  };

  // 反向映射：角度到天气类型
  const angleToWeather: Record<number, WeatherType> = {
    0: "rain",
    90: "snow",
    180: "clouds",
    270: "clear",
  };

  // 天气描述
  const weatherNames: Record<WeatherType, string> = {
    rain: "雨天",
    snow: "雪天",
    clouds: "多云",
    clear: "晴天",
  };

  // 初始化旋转角度，基于当前天气
  useEffect(() => {
    setRotationDegree(-weatherAngles[currentWeather]);
  }, [currentWeather]);

  // 处理点击旋转事件
  const handleRotate = () => {
    if (isRotating) return; // 防止动画中重复点击

    setIsRotating(true);

    // 添加点击动画效果
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${rotationDegree}deg) scale(0.9)`;
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${
            rotationDegree - 90
          }deg)`;
        }
      }, 50);
    }

    // 计算下一个天气的角度
    const currentAngle = weatherAngles[currentWeather];
    const nextAngle = (currentAngle + 90) % 360;
    const nextWeather = angleToWeather[nextAngle];

    // 设置旋转角度
    setRotationDegree((prev) => prev - 90);

    // 等待动画完成后更新天气
    setTimeout(() => {
      onWeatherChange(nextWeather);
      setIsRotating(false);
    }, 600); // 动画持续时间
  };

  // 鼠标悬停在各个区域上时的效果
  const handleSegmentHover = (weather: WeatherType) => {
    if (!isRotating) {
      setHoverState(weather);
    }
  };

  // 鼠标离开区域时的效果
  const handleSegmentLeave = () => {
    setHoverState(null);
  };

  return (
    <div className={styles.weatherSelector}>
      {/* 指针 */}
      <div className={styles.pointer}>
        {currentWeather && (
          <span className={styles.tooltipText}>
            {weatherNames[currentWeather]}
          </span>
        )}
      </div>

      {/* 旋转转盘 */}
      <div
        ref={wheelRef}
        className={styles.wheel}
        style={{ transform: `rotate(${rotationDegree}deg)` }}
        onClick={handleRotate}
      >
        {/* 雨 */}
        <div
          className={`${styles.segment} ${styles.rainSegment} ${
            hoverState === "rain" ? styles.segmentHover : ""
          }`}
          onMouseEnter={() => handleSegmentHover("rain")}
          onMouseLeave={handleSegmentLeave}
        >
          <div className={styles.icon}>
            <span className={styles.raindrop}></span>
            <span className={styles.raindrop}></span>
            <span className={styles.raindrop}></span>
          </div>
        </div>

        {/* 雪 */}
        <div
          className={`${styles.segment} ${styles.snowSegment} ${
            hoverState === "snow" ? styles.segmentHover : ""
          }`}
          onMouseEnter={() => handleSegmentHover("snow")}
          onMouseLeave={handleSegmentLeave}
        >
          <div className={styles.icon}>
            <span className={styles.snowflake}></span>
            <span className={styles.snowflake}></span>
            <span className={styles.snowflake}></span>
          </div>
        </div>

        {/* 多云 */}
        <div
          className={`${styles.segment} ${styles.cloudSegment} ${
            hoverState === "clouds" ? styles.segmentHover : ""
          }`}
          onMouseEnter={() => handleSegmentHover("clouds")}
          onMouseLeave={handleSegmentLeave}
        >
          <div className={styles.icon}>
            <span className={styles.cloud}></span>
          </div>
        </div>

        {/* 晴天 */}
        <div
          className={`${styles.segment} ${styles.sunSegment} ${
            hoverState === "clear" ? styles.segmentHover : ""
          }`}
          onMouseEnter={() => handleSegmentHover("clear")}
          onMouseLeave={handleSegmentLeave}
        >
          <div className={styles.icon}>
            <span className={styles.sun}></span>
          </div>
        </div>
      </div>
    </div>
  );
};
