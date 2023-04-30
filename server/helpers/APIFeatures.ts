import { APIFeaturesQueryType } from '../types/featuresTypes.ts';
import Tour from '../models/tourModel.ts';
import { ParsedQs } from 'qs';

class APIFeatures {
  query: APIFeaturesQueryType;
  queryString: ParsedQs;

  constructor(query: APIFeaturesQueryType, queryString: ParsedQs) {
    this.query = query;
    this.queryString = queryString;
  }

  //1 filtering
  filter() {
    // 1a excluding fields
    const queryObject = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);

    // 1b Advanced filtering gte, gt, lte, lt => $gte $gt $lte $lt
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // 2 sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.toString().split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // 3 field limiting
  select() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.toString().split(',').join(' ');

      this.query = this.query.select(fields);
    } else this.query = this.query.select('-__v');

    return this;
  }
  // 4 pagination
  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
