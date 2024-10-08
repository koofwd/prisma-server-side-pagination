export class PaginationService {
  max_limit: number;
  min_limit: number;
  default_limit: number;
  constructor() {
    this.max_limit = 1000;
    this.min_limit = 1;
    this.default_limit = 50;
  }
  private setLimit = (
    max_limit: number,
    min_limit: number,
    default_limit: number
  ) => {
    this.max_limit = max_limit;
    this.min_limit = min_limit;
    this.default_limit = default_limit;
  };
  private getPage = (page: number, lastPage: number) => {
    if (page < 1) return 1;
    if (page > lastPage) return lastPage;
    return page;
  };
  private getLastPage(count: number, take: number) {
    return Math.ceil(count / take);
  }
  private pageLimit(limit: number) {
    return limit < this.min_limit || limit > this.max_limit
      ? this.default_limit
      : limit;
  }
  private pageSkip(page: number, limit: number) {
    return (page - 1) * limit < 0 ? 0 : (page - 1) * limit;
  }
  private checkSearch(search: string) {
    if (search === "" || search === null) {
      return true;
    } else {
      return false;
    }
  }
  private paginationBuilder = (count: number, page: number, limit: number) => {
    const take = this.pageLimit(limit);
    const lastPage = this.getLastPage(count, take);
    const currentPage = this.getPage(page, lastPage);
    const skip = this.pageSkip(currentPage, take);
    return { take, skip, currentPage, lastPage };
  };
  private async getPagingDataWithoutSearch(
    table: any,
    page: number,
    limit: number,
    order: string
  ) {
    const count = await table.count({});
    const { take, skip, currentPage, lastPage } = this.paginationBuilder(
      count,
      page,
      limit
    );
    const rows = await table.findMany({
      skip,
      take,
      order,
    });
    return { count, currentPage, lastPage, limit: take, rows };
  }
  private async getPagingDataWithSearch(
    table: any,
    page: number,
    limit: number,
    search: string,
    order: string
  ) {
    const where = search;
    const count = await table.count({ where });
    const { take, skip, currentPage, lastPage } = this.paginationBuilder(
      count,
      page,
      limit
    );
    const rows = await table.findMany({
      where,
      skip,
      take,
      order,
    });
    return { count, currentPage, lastPage, limit: take, rows };
  }
  async setDefaultLimit(
    max_limit: number,
    min_limit: number,
    default_limit: number
  ) {
    this.setLimit(max_limit, min_limit, default_limit);
  }
  async getPagingData(
    table: any,
    page: number,
    limit: number,
    search: any,
    order: any
  ) {
    if (this.checkSearch(search)) {
      return this.getPagingDataWithoutSearch(table, page, limit, order);
    } else {
      return this.getPagingDataWithSearch(table, page, limit, search, order);
    }
  }
}
