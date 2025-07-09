export function statusParser(status: string) {
  switch (status) {
    case "COMPLETED":
      return "paid";
    default:
      return status;
  }
}