#!/usr/bin/env python3
"""
Payroll Calculator - Salary and Tax Calculator
薪酬和个税计算工具
"""

# 2025年中国个人所得税税率表
TAX_BRACKETS = [
    (36000, 0.03),      # 36,000以下, 3%
    (144000, 0.10),     # 36,000-144,000, 10%
    (300000, 0.20),     # 144,000-300,000, 20%
    (420000, 0.25),     # 300,000-420,000, 25%
    (660000, 0.30),     # 420,000-660,000, 30%
    (960000, 0.35),     # 660,000-960,000, 35%
    (float('inf'), 0.45)  # 960,000以上, 45%
]

# 速算扣除数
QUICK_DEDUCTION = [0, 2520, 16920, 31920, 52920, 85920, 181920]

def calculate_monthly_tax(annual_taxable_income):
    """
    计算年度个人所得税（综合所得）

    Args:
        annual_taxable_income: 年度应纳税所得额

    Returns:
        tuple: (年度税额, 税后年收入)
    """
    if annual_taxable_income <= 0:
        return 0, annual_taxable_income

    # 查找适用税率
    tax = 0
    prev_bracket = 0

    for i, (bracket, rate) in enumerate(TAX_BRACKETS):
        if annual_taxable_income <= bracket:
            # 找到适用档位
            taxable_in_bracket = annual_taxable_income - prev_bracket
            tax = annual_taxable_income * rate - QUICK_DEDUCTION[i]
            break
        prev_bracket = bracket

    after_tax = annual_taxable_income - tax
    return round(tax, 2), round(after_tax, 2)

def calculate_social_insurance(gross_salary, city="beijing"):
    """
    计算社保公积金（以北京为例）

    Args:
        gross_salary: 月度税前工资
        city: 城市代码

    Returns:
        dict: 社保公积金明细
    """
    # 北京2025年社保基数（示例数据，实际应查询最新标准）
    min_base = 6326
    max_base = 31884

    # 确定缴费基数
    base = max(min_base, min(gross_salary, max_base))

    # 个人缴费比例
    pension_personal = base * 0.08      # 养老保险 8%
    medical_personal = base * 0.02 + 3  # 医疗保险 2% + 3元
    unemployment_personal = base * 0.002  # 失业保险 0.2%
    housing_fund_personal = base * 0.12  # 公积金 12%

    # 单位缴费比例
    pension_company = base * 0.16       # 养老保险 16%
    medical_company = base * 0.09       # 医疗保险 9%
    unemployment_company = base * 0.008  # 失业保险 0.8%
    injury_company = base * 0.002       # 工伤保险 0.2%
    maternity_company = base * 0.008    # 生育保险 0.8%
    housing_fund_company = base * 0.12  # 公积金 12%

    personal_total = (
        pension_personal +
        medical_personal +
        unemployment_personal +
        housing_fund_personal
    )

    company_total = (
        pension_company +
        medical_company +
        unemployment_company +
        injury_company +
        maternity_company +
        housing_fund_company
    )

    return {
        "base": round(base, 2),
        "personal": {
            "pension": round(pension_personal, 2),
            "medical": round(medical_personal, 2),
            "unemployment": round(unemployment_personal, 2),
            "housing_fund": round(housing_fund_personal, 2),
            "total": round(personal_total, 2)
        },
        "company": {
            "pension": round(pension_company, 2),
            "medical": round(medical_company, 2),
            "unemployment": round(unemployment_company, 2),
            "injury": round(injury_company, 2),
            "maternity": round(maternity_company, 2),
            "housing_fund": round(housing_fund_company, 2),
            "total": round(company_total, 2)
        }
    }

def calculate_net_salary(gross_annual_salary, city="beijing"):
    """
    计算年度税后收入

    Args:
        gross_annual_salary: 年度税前工资
        city: 城市代码

    Returns:
        dict: 详细计算结果
    """
    monthly_gross = gross_annual_salary / 12

    # 计算社保公积金
    social_insurance = calculate_social_insurance(monthly_gross, city)
    annual_personal_si = social_insurance['personal']['total'] * 12
    annual_company_si = social_insurance['company']['total'] * 12

    # 计算应纳税所得额
    standard_deduction = 60000  # 基本减除费用 5000元/月 * 12
    special_deductions = 0  # 专项附加扣除（子女教育、房贷等，根据实际情况）

    taxable_income = gross_annual_salary - annual_personal_si - standard_deduction - special_deductions

    # 计算个税
    annual_tax, _ = calculate_monthly_tax(taxable_income)

    # 实发工资
    net_salary = gross_annual_salary - annual_personal_si - annual_tax
    monthly_net = net_salary / 12

    # 企业总成本
    total_cost = gross_annual_salary + annual_company_si

    return {
        "gross_annual": round(gross_annual_salary, 2),
        "monthly_gross": round(monthly_gross, 2),
        "social_insurance_personal_annual": round(annual_personal_si, 2),
        "social_insurance_company_annual": round(annual_company_si, 2),
        "taxable_income": round(taxable_income, 2),
        "annual_tax": round(annual_tax, 2),
        "net_annual": round(net_salary, 2),
        "monthly_net": round(monthly_net, 2),
        "total_cost_to_company": round(total_cost, 2),
        "tax_rate": round((annual_tax / gross_annual_salary) * 100, 2),
        "take_home_rate": round((net_salary / gross_annual_salary) * 100, 2)
    }

def main():
    """示例使用"""
    print("=== Payroll Calculator: 薪酬计算器 ===\n")

    # 示例：年薪30万的税后收入
    print("示例：年薪30万员工的薪酬计算")
    result = calculate_net_salary(300000, city="beijing")

    print(f"\n【收入部分】")
    print(f"年度税前工资: {result['gross_annual']:,.2f} 元")
    print(f"月度税前工资: {result['monthly_gross']:,.2f} 元")

    print(f"\n【扣除部分】")
    print(f"社保公积金（个人）: {result['social_insurance_personal_annual']:,.2f} 元/年")
    print(f"应纳税所得额: {result['taxable_income']:,.2f} 元")
    print(f"个人所得税: {result['annual_tax']:,.2f} 元/年")
    print(f"实际税率: {result['tax_rate']}%")

    print(f"\n【实发工资】")
    print(f"年度税后收入: {result['net_annual']:,.2f} 元")
    print(f"月度税后收入: {result['monthly_net']:,.2f} 元")
    print(f"到手率: {result['take_home_rate']}%")

    print(f"\n【企业成本】")
    print(f"社保公积金（企业）: {result['social_insurance_company_annual']:,.2f} 元/年")
    print(f"企业总成本: {result['total_cost_to_company']:,.2f} 元")
    print(f"成本系数: {result['total_cost_to_company'] / result['gross_annual']:.2f}")

    print("\n" + "="*50)
    print("不同年薪对比:")
    print("="*50)
    print(f"{'年薪(万)':<10} {'税后(万)':<10} {'到手率':<10} {'个税(万)':<10}")
    print("-"*50)

    for annual in [120000, 200000, 300000, 500000, 800000, 1000000]:
        result = calculate_net_salary(annual)
        print(f"{annual/10000:<10.0f} {result['net_annual']/10000:<10.1f} {result['take_home_rate']:<10.1f}% {result['annual_tax']/10000:<10.1f}")

if __name__ == "__main__":
    main()
