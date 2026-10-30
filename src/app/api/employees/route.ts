// src/app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateDataset } from "@/lib/dataset";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let employees = generateDataset();

  // --- FILTERS ---
  // 1. Department
  const department = searchParams.get("department");
  if (department && department !== "all") {
    employees = employees.filter((e) => e.department === department);
  }

  // 2. Gender
  const gender = searchParams.get("gender");
  if (gender && gender !== "all") {
    employees = employees.filter((e) => e.gender === gender);
  }

  // 3. Country
  const country = searchParams.get("country");
  if (country && country !== "all") {
    employees = employees.filter((e) => e.country === country);
  }

  // 4. Seniority Level
  const seniority = searchParams.get("seniority");
  if (seniority && seniority !== "all") {
    employees = employees.filter((e) => e.seniorityLevel === seniority);
  }

  // 5. Contract Type
  const contractType = searchParams.get("contractType");
  if (contractType && contractType !== "all") {
    employees = employees.filter((e) => e.contractType === contractType);
  }

  // 6. Remote
  const remote = searchParams.get("remote");
  if (remote === "true") employees = employees.filter((e) => e.remote);
  if (remote === "false") employees = employees.filter((e) => !e.remote);

  // 7. Education
  const education = searchParams.get("education");
  if (education && education !== "all") {
    employees = employees.filter((e) => e.education === education);
  }

  // 8. Min Salary
  const minSalary = searchParams.get("minSalary");
  if (minSalary) {
    employees = employees.filter((e) => e.salary >= Number(minSalary));
  }

  // 9. Max Salary
  const maxSalary = searchParams.get("maxSalary");
  if (maxSalary) {
    employees = employees.filter((e) => e.salary <= Number(maxSalary));
  }

  // 10. Min Age
  const minAge = searchParams.get("minAge");
  if (minAge) employees = employees.filter((e) => e.age >= Number(minAge));

  // 11. Max Age
  const maxAge = searchParams.get("maxAge");
  if (maxAge) employees = employees.filter((e) => e.age <= Number(maxAge));

  // 12. Performance (min)
  const minPerformance = searchParams.get("minPerformance");
  if (minPerformance) {
    employees = employees.filter((e) => e.performance >= Number(minPerformance));
  }

  // 13. Min Satisfaction
  const minSatisfaction = searchParams.get("minSatisfaction");
  if (minSatisfaction) {
    employees = employees.filter(
      (e) => e.satisfactionScore >= Number(minSatisfaction)
    );
  }

  // 14. Min Years Experience
  const minExperience = searchParams.get("minExperience");
  if (minExperience) {
    employees = employees.filter(
      (e) => e.yearsExperience >= Number(minExperience)
    );
  }

  // 15. Start Year Range
  const startYear = searchParams.get("startYear");
  if (startYear && startYear !== "all") {
    employees = employees.filter((e) =>
      e.startDate.startsWith(startYear)
    );
  }

  // --- STATS ---
  const total = employees.length;
  const avgSalary = total
    ? Math.round(employees.reduce((s, e) => s + e.salary, 0) / total)
    : 0;
  const avgAge = total
    ? Math.round(employees.reduce((s, e) => s + e.age, 0) / total)
    : 0;
  const avgPerformance = total
    ? parseFloat(
        (employees.reduce((s, e) => s + e.performance, 0) / total).toFixed(2)
      )
    : 0;
  const avgSatisfaction = total
    ? parseFloat(
        (employees.reduce((s, e) => s + e.satisfactionScore, 0) / total).toFixed(2)
      )
    : 0;
  const remoteCount = employees.filter((e) => e.remote).length;

  // By Department
  const byDepartment: Record<string, { count: number; avgSalary: number; avgPerformance: number }> = {};
  employees.forEach((e) => {
    if (!byDepartment[e.department]) {
      byDepartment[e.department] = { count: 0, avgSalary: 0, avgPerformance: 0 };
    }
    byDepartment[e.department].count++;
    byDepartment[e.department].avgSalary += e.salary;
    byDepartment[e.department].avgPerformance += e.performance;
  });
  Object.keys(byDepartment).forEach((d) => {
    const c = byDepartment[d].count;
    byDepartment[d].avgSalary = Math.round(byDepartment[d].avgSalary / c);
    byDepartment[d].avgPerformance = parseFloat(
      (byDepartment[d].avgPerformance / c).toFixed(2)
    );
  });

  // By Seniority
  const bySeniority: Record<string, number> = {};
  employees.forEach((e) => {
    bySeniority[e.seniorityLevel] = (bySeniority[e.seniorityLevel] || 0) + 1;
  });

  // By Country
  const byCountry: Record<string, number> = {};
  employees.forEach((e) => {
    byCountry[e.country] = (byCountry[e.country] || 0) + 1;
  });

  // By Education
  const byEducation: Record<string, number> = {};
  employees.forEach((e) => {
    byEducation[e.education] = (byEducation[e.education] || 0) + 1;
  });

  // By Gender
  const byGender: Record<string, number> = {};
  employees.forEach((e) => {
    byGender[e.gender] = (byGender[e.gender] || 0) + 1;
  });

  // Salary distribution
  const salaryBuckets = [
    { label: "< $50k", min: 0, max: 50000 },
    { label: "$50k-75k", min: 50000, max: 75000 },
    { label: "$75k-100k", min: 75000, max: 100000 },
    { label: "$100k-130k", min: 100000, max: 130000 },
    { label: "$130k-160k", min: 130000, max: 160000 },
    { label: "> $160k", min: 160000, max: Infinity },
  ];
  const salaryDistribution = salaryBuckets.map((b) => ({
    label: b.label,
    count: employees.filter((e) => e.salary >= b.min && e.salary < b.max).length,
  }));

  // Age distribution
  const ageBuckets = [
    { label: "22-29", min: 22, max: 29 },
    { label: "30-39", min: 30, max: 39 },
    { label: "40-49", min: 40, max: 49 },
    { label: "50-62", min: 50, max: 62 },
  ];
  const ageDistribution = ageBuckets.map((b) => ({
    label: b.label,
    count: employees.filter((e) => e.age >= b.min && e.age <= b.max).length,
  }));

  // Performance distribution
  const performanceDistribution = [1, 2, 3, 4, 5].map((p) => ({
    label: `⭐ ${p}`,
    count: employees.filter((e) => e.performance === p).length,
  }));

  // Hire trends by year
  const hireTrends: Record<string, number> = {};
  employees.forEach((e) => {
    const year = e.startDate.substring(0, 4);
    hireTrends[year] = (hireTrends[year] || 0) + 1;
  });

  // Remote vs On-site by department
  const remoteByDept: Record<string, { remote: number; onsite: number }> = {};
  employees.forEach((e) => {
    if (!remoteByDept[e.department]) remoteByDept[e.department] = { remote: 0, onsite: 0 };
    if (e.remote) remoteByDept[e.department].remote++;
    else remoteByDept[e.department].onsite++;
  });

  // Top performers
  const topPerformers = employees
    .filter((e) => e.performance === 5)
    .slice(0, 10)
    .map((e) => ({
      name: `${e.name} ${e.lastName}`,
      department: e.department,
      position: e.position,
      salary: e.salary,
      satisfaction: e.satisfactionScore,
    }));

  return NextResponse.json({
    total,
    avgSalary,
    avgAge,
    avgPerformance,
    avgSatisfaction,
    remoteCount,
    remotePct: total ? Math.round((remoteCount / total) * 100) : 0,
    byDepartment,
    bySeniority,
    byCountry,
    byEducation,
    byGender,
    salaryDistribution,
    ageDistribution,
    performanceDistribution,
    hireTrends,
    remoteByDept,
    topPerformers,
  });
}
