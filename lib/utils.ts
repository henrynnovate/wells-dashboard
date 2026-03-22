export function getColor(value: number, type: "LPE" | "OPE" | "GPE"): string {
    const limits = {
      LPE: { green: 85, yellow: 70 },
      OPE: { green: 90, yellow: 75 },
      GPE: { green: 80, yellow: 65 },
    };
  
    if (value >= limits[type].green) return "green";
    if (value >= limits[type].yellow) return "yellow";
    return "red";
  }