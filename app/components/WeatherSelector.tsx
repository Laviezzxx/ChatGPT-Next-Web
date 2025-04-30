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
  const [collapseDegree, setCollapseDegree] = useState(0); // 新增：收缩状态的额外旋转角度
  const [hoverState, setHoverState] = useState<WeatherType | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    if (isRotating || isCollapsed) return; // 防止动画中或收缩状态下重复点击

    setIsRotating(true);

    // 添加点击动画效果
    if (wheelRef.current) {
      // 应用缩放效果，但保持45度旋转
      wheelRef.current.classList.add(styles.clicking);

      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.classList.remove(styles.clicking);
        }
      }, 150);
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
    if (!isRotating && !isCollapsed) {
      setHoverState(weather);
    }
  };

  // 鼠标离开区域时的效果
  const handleSegmentLeave = () => {
    setHoverState(null);
  };

  // 切换收缩/展开状态
  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止事件冒泡到转盘

    // 设置收缩/展开状态
    setIsCollapsed((prev) => !prev);

    // 收缩时添加旋转效果，展开时恢复
    if (!isCollapsed) {
      // 收缩时添加180度旋转
      setCollapseDegree(180);
    } else {
      // 展开时恢复
      setCollapseDegree(0);
    }

    // 防止在动画过程中点击
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
    }, 600);
  };

  // 计算总旋转角度 = 基础旋转 + 折叠时额外旋转
  const totalRotationDegree = rotationDegree + collapseDegree;

  return (
    <div
      className={`${styles.weatherSelector} ${
        isCollapsed ? styles.collapsed : ""
      }`}
    >
      {/* 收缩/展开按钮 */}
      <button
        className={styles.collapseButton}
        onClick={toggleCollapse}
        aria-label={isCollapsed ? "展开天气选择器" : "收起天气选择器"}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={isCollapsed ? "M8 5l8 7-8 7" : "M16 5l-8 7 8 7"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 指针 */}
      <div className={styles.pointer}>
        {currentWeather && (
          <span className={styles.tooltipText}>
            {weatherNames[currentWeather]}
          </span>
        )}
      </div>

      {/* 旋转转盘 - 整体旋转45度，将动态旋转值应用为转盘样式 */}
      <div
        ref={wheelRef}
        className={`${styles.wheel} ${styles.rotated45}`}
        style={
          {
            "--rotation-angle": `${totalRotationDegree}deg`,
          } as React.CSSProperties
        }
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
