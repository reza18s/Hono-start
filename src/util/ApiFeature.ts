import { Document, Query } from "mongoose";
import { IUserDocument } from "../types";

export class ApiFeatures {
  query: Query<
    (Document<unknown, object, IUserDocument> & Required<{ _id: string }>)[],
    Document<unknown, object, IUserDocument> & IUserDocument
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(query: any) {
    this.query = query;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter(queryStr: any) {
    const objQuery = { ...queryStr };
    const excludedField = ["page", "sort", "limit", "fields"];
    excludedField.forEach((i) => {
      delete objQuery[i];
    });

    let objStr = JSON.stringify(objQuery);
    objStr = objStr.replace(/\b(gt|gte|lt|lte)\b/g, (i) => `$${i}`);
    this.query = this.query.find(JSON.parse(objStr));
    return this;
  }
  sort(sort: string | undefined) {
    if (sort) {
      const sortBy = sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  fields(fields: string | undefined) {
    if (fields) {
      const newFields = fields.split(",").join(" ");
      this.query = this.query.select(newFields);
    }
    return this;
  }
  pagination(page: string = "1", limit: string = "10") {
    const skip = (+page - 1) * +limit;
    this.query = this.query.skip(skip).limit(+limit);
    this.query = this.query.select("-__v -id");

    // if (this.queryStr.page) {
    //    const numTours = await this.query.countDocuments();
    //    if (skip > numTours) throw new Error("This page does not exist!");
    // }
    return this;
  }
}
