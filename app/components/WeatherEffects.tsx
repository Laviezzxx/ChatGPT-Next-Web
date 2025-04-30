"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./WeatherEffects.module.scss";
import { WeatherSelector, WeatherType } from "./WeatherSelector";

interface WeatherData {
  weather: WeatherType;
  temperature: number;
}

export const WeatherEffects = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualWeather, setManualWeather] = useState<WeatherType | null>(null);
  const rainContainerRef = useRef<HTMLDivElement>(null);

  // 获取天气数据
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // 获取IP地址
        const ipResponse = await fetch("https://api.ipify.cn/?format=json");
        const { ip } = await ipResponse.json();

        // 使用IP获取位置信息
        const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        const locationData = await locationResponse.json();

        // 获取天气信息
        // a1988bb6a3a91930e13b8ccc997f3af3
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${locationData.latitude}&lon=${locationData.longitude}&appid=a1988bb6a3a91930e13b8ccc997f3af3&units=metric`,
        );
        const weatherData = await weatherResponse.json();
        // 将OpenWeather API的天气类型映射到我们的类型
        let mappedWeather: WeatherType = "clear";
        const apiWeather = weatherData.weather[0].main.toLowerCase();

        if (
          apiWeather.includes("rain") ||
          apiWeather.includes("drizzle") ||
          apiWeather.includes("thunderstorm")
        ) {
          mappedWeather = "rain";
        } else if (apiWeather.includes("snow")) {
          mappedWeather = "snow";
        } else if (
          apiWeather.includes("cloud") ||
          apiWeather.includes("fog") ||
          apiWeather.includes("mist") ||
          apiWeather.includes("haze")
        ) {
          mappedWeather = "clouds";
        } else {
          mappedWeather = "clear";
        }

        setWeatherData({
          weather: mappedWeather,
          temperature: weatherData.main.temp,
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
        // 如果获取失败，默认显示雪花效果
        setWeatherData({ weather: "rain", temperature: 20 });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // 处理天气切换
  const handleWeatherChange = (newWeather: WeatherType) => {
    setManualWeather(newWeather);
  };

  // 生成雨滴和涟漪的效果
  useEffect(() => {
    const currentWeather = manualWeather || weatherData?.weather || "clear";
    if (currentWeather !== "rain" || !rainContainerRef.current) return;

    let clientWidth = window.innerWidth;
    let clientHeight = window.innerHeight;
    let isActive = true;

    // 窗口大小变化时更新尺寸
    const handleResize = () => {
      clientWidth = window.innerWidth;
      clientHeight = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // 创建雨滴和涟漪
    const createRaindrop = () => {
      if (!isActive || !rainContainerRef.current) return;

      // 创建雨滴
      const raindrop = document.createElement("div");
      raindrop.setAttribute("class", styles.raindrop);

      // 添加一些随机性，使雨滴看起来更自然
      const left = Math.random() * clientWidth;
      const scale = 0.7 + Math.random() * 0.6; // 0.7-1.3之间的随机大小
      const rotationAngle = 2 + Math.random() * 5; // 2-7度之间的随机倾斜角度

      raindrop.style.left = `${left}px`;
      raindrop.style.transform = `rotate(${rotationAngle}deg) scale(${scale})`;

      rainContainerRef.current.appendChild(raindrop);

      // 雨滴落地时的位置（底部随机位置）
      const landingPosition = clientHeight - 10 - Math.random() * 20;

      // 监听雨滴动画结束事件，创建涟漪
      raindrop.addEventListener("animationend", () => {
        if (!isActive || !rainContainerRef.current) return;

        // 移除雨滴
        if (rainContainerRef.current.contains(raindrop)) {
          rainContainerRef.current.removeChild(raindrop);
        }

        // 创建涟漪，确保涟漪在雨滴落地位置
        const ripple = document.createElement("div");
        ripple.setAttribute("class", styles.ripple);
        ripple.style.left = `${left}px`;
        ripple.style.top = `${landingPosition}px`;

        // 随机涟漪大小
        const rippleScale = 0.8 + Math.random() * 0.4; // 0.8-1.2之间的随机大小
        ripple.style.transform = `rotateX(65deg) translate(-50%, -50%) scale(${rippleScale})`;

        rainContainerRef.current.appendChild(ripple);

        // 涟漪消失后移除
        ripple.addEventListener("animationend", () => {
          if (
            rainContainerRef.current &&
            rainContainerRef.current.contains(ripple)
          ) {
            rainContainerRef.current.removeChild(ripple);
          }
        });
      });

      // 递归调用，创建下一滴雨（保持适当频率）
      setTimeout(createRaindrop, 1000 + Math.random() * 1500);
    };

    // 启动雨滴动画 - 初始时创建多个雨滴，营造初始效果
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        if (isActive) createRaindrop();
      }, i * 100);
    }

    // 清理函数
    return () => {
      isActive = false;
      window.removeEventListener("resize", handleResize);

      // 清理所有雨滴和涟漪
      if (rainContainerRef.current) {
        const elements = rainContainerRef.current.querySelectorAll(
          `.${styles.raindrop}, .${styles.ripple}`,
        );
        elements.forEach((el) => {
          if (rainContainerRef.current?.contains(el)) {
            rainContainerRef.current.removeChild(el);
          }
        });
      }
    };
  }, [manualWeather, weatherData?.weather]);

  if (loading) return null;

  // 确定当前要显示的天气类型
  const currentWeather = manualWeather || weatherData?.weather || "clear";

  const renderWeatherEffect = () => {
    switch (currentWeather) {
      case "rain":
        return (
          <div className={styles.rainContainer} ref={rainContainerRef}>
            {/* 雨滴和涟漪会通过JavaScript动态创建 */}
          </div>
        );
      case "snow":
        return (
          <div className={styles.snowflakes}>
            {Array.from({ length: 50 }).map((_, i) => (
              <span key={i} className={styles.snowflake} />
            ))}
          </div>
        );
      case "clouds":
        return (
          <div className={styles.cloudContainer}>
            <div className={styles.cloud_one}></div>
            <div className={styles.cloud_two}></div>
            <div className={styles.cloud_three}></div>
            <div className={styles.cloud_four}></div>
            <div className={styles.cloud_five}></div>
            <div className={styles.cloud_six}></div>
          </div>
        );
      case "clear":
        return (
          <div className={styles.sunContainer}>
            <div className={styles.sun} />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.sunray} />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={styles.weatherEffects}>{renderWeatherEffect()}</div>
      <WeatherSelector
        currentWeather={currentWeather}
        onWeatherChange={handleWeatherChange}
      />
    </>
  );
};
