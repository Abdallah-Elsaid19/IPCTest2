export const bursaryModules = [
  {
    value: "ai",
    title: "AI",
    meta: "Individual professional module",
    costGbp: 4_000,
    supportPercentage: 50,
    description: "Build practical capability in applying artificial intelligence within a professional project environment.",
  },
  {
    value: "pmi_sp",
    title: "PMI-SP",
    meta: "Individual professional module",
    costGbp: 4_000,
    supportPercentage: 50,
    description: "Develop specialist planning and scheduling knowledge for project delivery.",
  },
  {
    value: "evm",
    title: "EVM",
    meta: "Individual professional module",
    costGbp: 4_000,
    supportPercentage: 50,
    description: "Strengthen earned value management knowledge and performance measurement practice.",
  },
  {
    value: "risk",
    title: "Risk",
    meta: "Individual professional module",
    costGbp: 4_000,
    supportPercentage: 50,
    description: "Develop practical project risk identification, assessment and response skills.",
  },
  {
    value: "ppc",
    title: "PPC",
    meta: "Individual professional module",
    costGbp: 4_000,
    supportPercentage: 50,
    description: "Build focused professional capability in project planning and controls.",
  },
  {
    value: "msp",
    title: "MSP",
    meta: "Individual professional module",
    costGbp: 4_000,
    supportPercentage: 50,
    description: "Develop structured programme-management knowledge and practice.",
  },
  {
    value: "managing_portfolios",
    title: "Managing Portfolios",
    meta: "Individual professional module",
    costGbp: 4_000,
    supportPercentage: 50,
    description: "Build the skills needed to support effective portfolio-level decisions and delivery.",
  },
  {
    value: "stakeholder_management",
    title: "Stakeholder",
    meta: "Individual professional module",
    costGbp: 4_000,
    supportPercentage: 50,
    description: "Strengthen stakeholder analysis, engagement and communication practice.",
  },
  {
    value: "pmo_module",
    title: "PMO",
    meta: "Individual professional module",
    costGbp: 4_000,
    supportPercentage: 50,
    description: "Build focused practical knowledge in PMO governance, assurance and delivery support.",
  },
  {
    value: "pmp",
    title: "PMP",
    meta: "Two-module programme",
    costGbp: 8_000,
    supportPercentage: 75,
    description: "Develop project management knowledge aligned with professional practice.",
  },
  {
    value: "pmo",
    title: "Certified PMO",
    meta: "Four-module professional package",
    costGbp: 16_000,
    supportPercentage: 75,
    description: "Complete a four-module professional package covering PMO, Risk, Planning and Stakeholder.",
  },
] as const;

export type BursaryModuleValue = (typeof bursaryModules)[number]["value"];

export interface BursaryFundingEstimate {
  lines: Array<{
    value: BursaryModuleValue;
    title: string;
    costGbp: number;
    supportPercentage: number;
    discountGbp: number;
    amountPayableGbp: number;
  }>;
  totalCostGbp: number;
  totalDiscountGbp: number;
  totalPayableGbp: number;
}

export function calculateBursaryFundingEstimate(
  selectedValues: readonly string[],
): BursaryFundingEstimate {
  const selected = new Set(selectedValues);
  const lines = bursaryModules
    .filter((module) => selected.has(module.value))
    .map((module) => {
      const discountGbp = module.costGbp * (module.supportPercentage / 100);
      return {
        value: module.value,
        title: module.title,
        costGbp: module.costGbp,
        supportPercentage: module.supportPercentage,
        discountGbp,
        amountPayableGbp: module.costGbp - discountGbp,
      };
    });

  return lines.reduce<BursaryFundingEstimate>(
    (estimate, line) => ({
      lines: [...estimate.lines, line],
      totalCostGbp: estimate.totalCostGbp + line.costGbp,
      totalDiscountGbp: estimate.totalDiscountGbp + line.discountGbp,
      totalPayableGbp: estimate.totalPayableGbp + line.amountPayableGbp,
    }),
    {
      lines: [],
      totalCostGbp: 0,
      totalDiscountGbp: 0,
      totalPayableGbp: 0,
    },
  );
}
