export function getPaginationFromRequest(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = Number.parseInt(searchParams.get('skip') || '0');
  const take = Number.parseInt(searchParams.get('take') || '20');
  return { skip, take };
}
