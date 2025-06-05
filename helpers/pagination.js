module.exports = (objectInitial, query, totalRecord) => {
  const objectPagination = {
    ...objectInitial,
  };

  objectPagination.totalPage = Math.ceil(
    totalRecord / objectPagination.limitItems
  );

  if (query.page) {
    let page = Number(query.page);
    objectPagination.currentPage = page;
    objectPagination.skip = (page - 1) * objectPagination.limitItems;
  }

  return objectPagination;
};
