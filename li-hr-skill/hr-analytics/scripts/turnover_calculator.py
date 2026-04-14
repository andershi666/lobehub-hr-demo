#!/usr/bin/env python3
"""
HR Analytics - Turnover Rate Calculator
计算和分析员工离职率
"""

import sys
from datetime import datetime, timedelta

def calculate_turnover_rate(start_headcount, end_headcount, departures, period_months=12):
    """
    计算离职率

    Args:
        start_headcount: 期初人数
        end_headcount: 期末人数
        departures: 离职人数
        period_months: 统计周期（月）

    Returns:
        dict: 各种离职率指标
    """
    avg_headcount = (start_headcount + end_headcount) / 2

    # 年化离职率
    annual_turnover = (departures / avg_headcount) * (12 / period_months) * 100

    # 月均离职率
    monthly_turnover = annual_turnover / 12

    # 期间离职率
    period_turnover = (departures / avg_headcount) * 100

    return {
        "period_months": period_months,
        "start_headcount": start_headcount,
        "end_headcount": end_headcount,
        "avg_headcount": avg_headcount,
        "departures": departures,
        "period_turnover_rate": round(period_turnover, 2),
        "annual_turnover_rate": round(annual_turnover, 2),
        "monthly_turnover_rate": round(monthly_turnover, 2)
    }

def analyze_turnover_trend(monthly_data):
    """
    分析离职率趋势

    Args:
        monthly_data: list of dict with keys: month, departures, headcount

    Returns:
        dict: 趋势分析结果
    """
    if len(monthly_data) < 2:
        return {"error": "需要至少2个月的数据"}

    turnover_rates = []
    for data in monthly_data:
        rate = (data['departures'] / data['headcount']) * 100
        turnover_rates.append(rate)

    avg_rate = sum(turnover_rates) / len(turnover_rates)
    max_rate = max(turnover_rates)
    min_rate = min(turnover_rates)

    # 简单趋势判断
    recent_avg = sum(turnover_rates[-3:]) / 3
    earlier_avg = sum(turnover_rates[:3]) / 3

    if recent_avg > earlier_avg * 1.2:
        trend = "上升"
    elif recent_avg < earlier_avg * 0.8:
        trend = "下降"
    else:
        trend = "平稳"

    return {
        "average_monthly_rate": round(avg_rate, 2),
        "max_rate": round(max_rate, 2),
        "min_rate": round(min_rate, 2),
        "trend": trend,
        "recent_3month_avg": round(recent_avg, 2),
        "earlier_3month_avg": round(earlier_avg, 2)
    }

def calculate_regrettable_loss_rate(total_departures, regrettable_departures):
    """
    计算遗憾离职率

    Args:
        total_departures: 总离职人数
        regrettable_departures: 遗憾离职人数（关键人才/高绩效）

    Returns:
        float: 遗憾离职率百分比
    """
    if total_departures == 0:
        return 0.0

    return round((regrettable_departures / total_departures) * 100, 2)

def main():
    """示例使用"""
    print("=== HR Analytics: 离职率计算器 ===\n")

    # 示例1：年度离职率
    print("示例1：2025年度离职率")
    result = calculate_turnover_rate(
        start_headcount=280,
        end_headcount=290,
        departures=45,
        period_months=12
    )

    print(f"期初人数: {result['start_headcount']}")
    print(f"期末人数: {result['end_headcount']}")
    print(f"平均人数: {result['avg_headcount']}")
    print(f"离职人数: {result['departures']}")
    print(f"年化离职率: {result['annual_turnover_rate']}%")
    print(f"月均离职率: {result['monthly_turnover_rate']}%\n")

    # 示例2：趋势分析
    print("示例2：月度离职率趋势分析")
    monthly_data = [
        {"month": "2025-01", "headcount": 280, "departures": 3},
        {"month": "2025-02", "headcount": 282, "departures": 4},
        {"month": "2025-03", "headcount": 283, "departures": 3},
        {"month": "2025-04", "headcount": 285, "departures": 5},
        {"month": "2025-05", "headcount": 287, "departures": 6},
        {"month": "2025-06", "headcount": 288, "departures": 7},
    ]

    trend = analyze_turnover_trend(monthly_data)
    print(f"平均月离职率: {trend['average_monthly_rate']}%")
    print(f"最高月离职率: {trend['max_rate']}%")
    print(f"最低月离职率: {trend['min_rate']}%")
    print(f"趋势: {trend['trend']}")
    print(f"近3月平均: {trend['recent_3month_avg']}%")
    print(f"前3月平均: {trend['earlier_3month_avg']}%\n")

    # 示例3：遗憾离职率
    print("示例3：遗憾离职率分析")
    regrettable_rate = calculate_regrettable_loss_rate(
        total_departures=45,
        regrettable_departures=18
    )
    print(f"总离职人数: 45")
    print(f"遗憾离职人数: 18")
    print(f"遗憾离职率: {regrettable_rate}%")
    print("（建议目标：<30%）\n")

if __name__ == "__main__":
    main()
