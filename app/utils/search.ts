export function getSearchFromRequest(request: Request) {
  const { searchParams } = new URL(request.url);
  return searchParams.get('q') || '';
}
