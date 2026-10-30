// src/lib/dataset.ts
// SaiyanCorp - Empresa ficticia con 1000 empleados

export type Employee = {
  id: number;
  name: string;
  lastName: string;
  department: string;
  position: string;
  salary: number;
  age: number;
  gender: "M" | "F" | "NB";
  country: string;
  city: string;
  startDate: string;
  performance: number; // 1-5
  remote: boolean;
  contractType: "full-time" | "part-time" | "contractor";
  education: "high-school" | "bachelor" | "master" | "phd";
  yearsExperience: number;
  teamSize: number;
  projectsCompleted: number;
  trainingHours: number;
  absenceDays: number;
  satisfactionScore: number; // 1-10
  seniorityLevel: "junior" | "mid" | "senior" | "lead" | "executive";
};

const dragonBallFirstNames = [
  "Goku", "Vegeta", "Gohan", "Piccolo", "Trunks", "Goten", "Frieza", "Cell",
  "Beerus", "Whis", "Broly", "Bardock", "Raditz", "Nappa", "Krillin", "Yamcha",
  "Tien", "Chiaotzu", "Bulma", "Chi-Chi", "Videl", "Pan", "Bulla", "Android18",
  "Android17", "Dabura", "Majin", "Buu", "Cooler", "Slug", "Turles", "Bojack",
  "Zarbon", "Dodoria", "Ginyu", "Recoome", "Burter", "Jeice", "Guldo", "Hit",
  "Cabba", "Caulifla", "Kale", "Champa", "Vados", "Toppo", "Jiren", "Dyspo",
  "Moro", "Granolah", "Gas", "Elec", "Macki", "Shenron", "Porunga", "Oolong",
  "Puar", "Launch", "Lunch", "Korin", "Yajirobe", "Dende", "Nail", "Cargo",
  "Gotenks", "Vegito", "Gogeta", "Fused", "Janemba", "Tapion", "Hirudegarn",
];

const marvelFirstNames = [
  "Tony", "Steve", "Natasha", "Bruce", "Thor", "Clint", "Peter", "Wanda",
  "Vision", "Scott", "Hope", "Sam", "Bucky", "T'Challa", "Shuri", "Okoye",
  "Carol", "Nick", "Maria", "Fury", "Rhodey", "Pepper", "Happy", "James",
  "Gamora", "Nebula", "Rocket", "Groot", "Drax", "Quill", "Mantis", "Yondu",
  "Loki", "Hela", "Odin", "Frigga", "Heimdall", "Sif", "Valkyrie", "Korg",
  "Strange", "Wong", "Mordo", "Christine", "America", "Yelena", "Rick", "Monica",
  "Kamala", "Riri", "Kate", "Eli", "Billy", "Tommy", "Speed", "Hulkling",
  "Patriot", "Stature", "Jessica", "Luke", "Danny", "Colleen", "Matt", "Foggy",
  "Karen", "Frank", "Trish", "Misty", "Diamondback", "Elektra", "Punisher",
];

const lastNames = [
  "Briefs", "Son", "Namek", "Saiyan", "Piccolo-Jr", "Trunk", "Brief",
  "Stark", "Rogers", "Romanoff", "Banner", "Odinson", "Barton", "Parker",
  "Maximoff", "Potts", "Rhodes", "Wilson", "Barnes", "Udaku", "Danvers",
  "Quill", "Gamora", "Drax", "Rocket", "Mantis", "Thanos", "Murdock",
  "Castle", "Jones", "Cage", "Rand", "Wing", "Strange", "Mordo",
  "Orellana", "Fuentes", "García", "López", "Martínez", "Sánchez", "Torres",
  "Ramírez", "Flores", "Rivera", "Gómez", "Díaz", "Morales", "Reyes",
];

const departments = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "HR", "Finance", "Operations", "Legal", "Data Science",
  "Customer Success", "DevOps", "Security", "Research",
];

const positionsByDepartment: Record<string, string[]> = {
  Engineering: ["Software Engineer", "Backend Engineer", "Frontend Engineer", "Full-Stack Engineer", "Mobile Engineer", "QA Engineer"],
  Product: ["Product Manager", "Product Owner", "Business Analyst", "Product Strategist"],
  Design: ["UX Designer", "UI Designer", "Product Designer", "Graphic Designer", "Motion Designer"],
  Marketing: ["Marketing Manager", "Content Creator", "SEO Specialist", "Brand Manager", "Growth Hacker"],
  Sales: ["Sales Representative", "Account Executive", "Sales Manager", "Business Development"],
  HR: ["HR Manager", "Recruiter", "People Ops", "Talent Acquisition", "HR Business Partner"],
  Finance: ["Financial Analyst", "Controller", "Accountant", "CFO Staff", "Treasury Analyst"],
  Operations: ["Operations Manager", "Project Manager", "Process Analyst", "Logistics Coordinator"],
  Legal: ["Legal Counsel", "Paralegal", "Compliance Officer", "Contract Manager"],
  "Data Science": ["Data Scientist", "ML Engineer", "Data Analyst", "Data Engineer", "AI Researcher"],
  "Customer Success": ["Customer Success Manager", "Support Engineer", "Implementation Specialist"],
  DevOps: ["DevOps Engineer", "SRE", "Platform Engineer", "Cloud Architect"],
  Security: ["Security Engineer", "Penetration Tester", "Security Analyst", "CISO Staff"],
  Research: ["Research Scientist", "Research Engineer", "Lab Manager", "Principal Researcher"],
};

const countries = [
  "USA", "Mexico", "Colombia", "Argentina", "Brazil", "Spain", "UK",
  "Germany", "France", "Canada", "Japan", "South Korea", "India", "Australia",
];

const citiesByCountry: Record<string, string[]> = {
  USA: ["New York", "San Francisco", "Austin", "Seattle", "Chicago"],
  Mexico: ["Mexico City", "Guadalajara", "Monterrey"],
  Colombia: ["Bogotá", "Medellín", "Cali"],
  Argentina: ["Buenos Aires", "Córdoba", "Rosario"],
  Brazil: ["São Paulo", "Rio de Janeiro", "Belo Horizonte"],
  Spain: ["Madrid", "Barcelona", "Valencia"],
  UK: ["London", "Manchester", "Edinburgh"],
  Germany: ["Berlin", "Munich", "Hamburg"],
  France: ["Paris", "Lyon", "Marseille"],
  Canada: ["Toronto", "Vancouver", "Montreal"],
  Japan: ["Tokyo", "Osaka", "Kyoto"],
  "South Korea": ["Seoul", "Busan", "Incheon"],
  India: ["Bangalore", "Mumbai", "Hyderabad"],
  Australia: ["Sydney", "Melbourne", "Brisbane"],
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function randomChoice<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randomInt(min: number, max: number, rand: () => number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date, rand: () => number): string {
  const d = new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));
  return d.toISOString().split("T")[0];
}

let _cachedDataset: Employee[] | null = null;

export function generateDataset(): Employee[] {
  if (_cachedDataset) return _cachedDataset;

  const rand = seededRandom(42);
  const employees: Employee[] = [];
  const allFirstNames = [...dragonBallFirstNames, ...marvelFirstNames];
  const usedNames = new Set<string>();

  for (let i = 0; i < 1000; i++) {
    let name: string;
    let attempts = 0;
    do {
      const fn = randomChoice(allFirstNames, rand);
      const ln = randomChoice(lastNames, rand);
      name = `${fn} ${ln}`;
      attempts++;
    } while (usedNames.has(name) && attempts < 50);
    usedNames.add(name);

    const [firstName, lastName] = name.split(" ");
    const department = randomChoice(departments, rand);
    const positions = positionsByDepartment[department];
    const position = randomChoice(positions, rand);
    const country = randomChoice(countries, rand);
    const cities = citiesByCountry[country] || ["Unknown"];
    const city = randomChoice(cities, rand);
    const gender = randomChoice(["M", "F", "NB"] as const, rand);
    const age = randomInt(22, 62, rand);
    const yearsExperience = Math.min(randomInt(0, age - 20, rand), 35);
    const seniorityLevel = yearsExperience < 2
      ? "junior"
      : yearsExperience < 5
      ? "mid"
      : yearsExperience < 10
      ? "senior"
      : yearsExperience < 18
      ? "lead"
      : "executive";

    const baseSalary: Record<string, number> = {
      junior: 45000, mid: 70000, senior: 100000, lead: 130000, executive: 180000,
    };
    const salary = Math.round(
      (baseSalary[seniorityLevel] + randomInt(-10000, 20000, rand)) / 100
    ) * 100;

    const education = randomChoice(
      ["high-school", "bachelor", "master", "phd"] as const, rand
    );

    const performance = randomInt(1, 5, rand);
    const satisfactionScore = randomInt(1, 10, rand);
    const contractType = randomChoice(
      ["full-time", "full-time", "full-time", "part-time", "contractor"] as const, rand
    );
    const remote = rand() > 0.45;
    const teamSize = randomInt(3, 20, rand);
    const projectsCompleted = randomInt(1, 50, rand);
    const trainingHours = randomInt(0, 120, rand);
    const absenceDays = randomInt(0, 25, rand);

    const startDate = randomDate(
      new Date("2015-01-01"), new Date("2024-06-01"), rand
    );

    employees.push({
      id: i + 1,
      name: firstName,
      lastName,
      department,
      position,
      salary,
      age,
      gender,
      country,
      city,
      startDate,
      performance,
      remote,
      contractType,
      education,
      yearsExperience,
      teamSize,
      projectsCompleted,
      trainingHours,
      absenceDays,
      satisfactionScore,
      seniorityLevel,
    });
  }

  _cachedDataset = employees;
  return employees;
}
