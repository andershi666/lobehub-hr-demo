#!/usr/bin/env python3
"""
Recruitment Analytics - Time to Fill Calculator
招聘周期分析工具
"""

from datetime import datetime, timedelta
from statistics import mean, median

def calculate_time_to_fill(req_open_date, offer_accepted_date):
    """
    计算单个职位的招聘周期

    Args:
        req_open_date: 职位发布日期 (datetime or str 'YYYY-MM-DD')
        offer_accepted_date: Offer接受日期 (datetime or str 'YYYY-MM-DD')

    Returns:
        int: 招聘周期（天数）
    """
    if isinstance(req_open_date, str):
        req_open_date = datetime.strptime(req_open_date, '%Y-%m-%d')
    if isinstance(offer_accepted_date, str):
        offer_accepted_date = datetime.strptime(offer_accepted_date, '%Y-%m-%d')

    return (offer_accepted_date - req_open_date).days

def analyze_recruitment_efficiency(positions_data):
    """
    分析招聘效率指标

    Args:
        positions_data: list of dict with keys:
            - position_name
            - req_open_date
            - offer_accepted_date
            - level (optional)
            - department (optional)

    Returns:
        dict: 招聘效率分析结果
    """
    if not positions_data:
        return {"error": "无数据"}

    time_to_fill_list = []
    for pos in positions_data:
        ttf = calculate_time_to_fill(
            pos['req_open_date'],
            pos['offer_accepted_date']
        )
        time_to_fill_list.append(ttf)
        pos['time_to_fill'] = ttf

    return {
        "total_positions": len(positions_data),
        "avg_time_to_fill": round(mean(time_to_fill_list), 1),
        "median_time_to_fill": median(time_to_fill_list),
        "min_time_to_fill": min(time_to_fill_list),
        "max_time_to_fill": max(time_to_fill_list),
        "positions_filled_30days": len([x for x in time_to_fill_list if x <= 30]),
        "positions_filled_60days": len([x for x in time_to_fill_list if x <= 60]),
        "positions_over_90days": len([x for x in time_to_fill_list if x > 90])
    }

def calculate_offer_acceptance_rate(offers_made, offers_accepted):
    """
    计算Offer接受率

    Args:
        offers_made: 发出的Offer数量
        offers_accepted: 接受的Offer数量

    Returns:
        float: Offer接受率百分比
    """
    if offers_made == 0:
        return 0.0
    return round((offers_accepted / offers_made) * 100, 2)

def calculate_interview_to_offer_ratio(interviews_conducted, offers_made):
    """
    计算面试转化率

    Args:
        interviews_conducted: 面试人数
        offers_made: 发出Offer数量

    Returns:
        float: 面试转化率百分比
    """
    if interviews_conducted == 0:
        return 0.0
    return round((offers_made / interviews_conducted) * 100, 2)

def main():
    """示例使用"""
    print("=== Recruitment Analytics: 招聘效率分析 ===\n")

    # 示例数据
    positions = [
        {
            "position_name": "高级Java工程师",
            "req_open_date": "2025-01-15",
            "offer_accepted_date": "2025-03-10",
            "level": "P6",
            "department": "研发"
        },
        {
            "position_name": "产品经理",
            "req_open_date": "2025-02-01",
            "offer_accepted_date": "2025-03-25",
            "level": "P5",
            "department": "产品"
        },
        {
            "position_name": "数据分析师",
            "req_open_date": "2025-01-20",
            "offer_accepted_date": "2025-04-15",
            "level": "P5",
            "department": "数据"
        },
        {
            "position_name": "UI设计师",
            "req_open_date": "2025-02-10",
            "offer_accepted_date": "2025-03-20",
            "level": "P4",
            "department": "设计"
        },
        {
            "position_name": "销售经理",
            "req_open_date": "2025-01-25",
            "offer_accepted_date": "2025-02-28",
            "level": "M1",
            "department": "销售"
        }
    ]

    # 分析招聘周期
    print("招聘周期分析（Time to Fill）")
    efficiency = analyze_recruitment_efficiency(positions)

    print(f"招聘职位数: {efficiency['total_positions']}")
    print(f"平均招聘周期: {efficiency['avg_time_to_fill']} 天")
    print(f"中位数招聘周期: {efficiency['median_time_to_fill']} 天")
    print(f"最短周期: {efficiency['min_time_to_fill']} 天")
    print(f"最长周期: {efficiency['max_time_to_fill']} 天")
    print(f"30天内完成: {efficiency['positions_filled_30days']} 个")
    print(f"60天内完成: {efficiency['positions_filled_60days']} 个")
    print(f"超过90天: {efficiency['positions_over_90days']} 个\n")

    # 行业基准对比
    print("行业基准对比")
    benchmarks = {
        "初级岗位": 30,
        "中级岗位": 45,
        "高级岗位": 60,
        "管理岗位": 75
    }

    for level, benchmark in benchmarks.items():
        status = "✓ 优秀" if efficiency['avg_time_to_fill'] < benchmark else "- 待提升"
        print(f"{level}: 基准 {benchmark}天, 实际 {efficiency['avg_time_to_fill']}天 {status}")

    print("\n其他指标示例:")

    # Offer接受率
    offer_rate = calculate_offer_acceptance_rate(
        offers_made=8,
        offers_accepted=5
    )
    print(f"Offer接受率: {offer_rate}% (目标: >80%)")

    # 面试转化率
    interview_ratio = calculate_interview_to_offer_ratio(
        interviews_conducted=25,
        offers_made=8
    )
    print(f"面试转化率: {interview_ratio}% (目标: 25-40%)")

if __name__ == "__main__":
    main()
