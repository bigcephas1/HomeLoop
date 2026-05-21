const pagination = (page = 1, limit = 10) => {
  const currentPage = Number(page);
  const perPage = Number(limit);

  const skip = (currentPage - 1) * perPage;

  return {
    skip,
    limit: perPage,
  };
};

export default pagination;
