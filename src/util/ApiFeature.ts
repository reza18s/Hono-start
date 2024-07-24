import QueryString from "qs";
import { Document, Query } from "mongoose";
import { IUserDocument, ITours, IReview } from "../types";

export class ApiFeatures {
   query: Query<
      (Document<unknown, object, ITours | IUserDocument | IReview> &
         Required<{ _id: string }>)[],
      Document<unknown, object, ITours | IUserDocument | IReview> &
         ITours &
         IUserDocument &
         IReview
   >;

   queryStr: QueryString.ParsedQs;
   constructor(query, queryStr: QueryString.ParsedQs) {
      this.query = query;
      this.queryStr = queryStr;
   }
   filter() {
      const objQuery = { ...this.queryStr };
      const excludedField = ["page", "sort", "limit", "fields"];
      excludedField.forEach((i) => {
         delete objQuery[i];
      });

      let objStr = JSON.stringify(objQuery);
      objStr = objStr.replace(/\b(gt|gte|lt|lte)\b/g, (i) => `$${i}`);
      this.query = this.query.find(JSON.parse(objStr));
      return this;
   }
   sort() {
      if (this.queryStr.sort) {
         const sortBy = (this.queryStr.sort as string).split(",").join(" ");
         this.query = this.query.sort(sortBy);
      } else {
         this.query = this.query.sort("-createdAt");
      }
      return this;
   }
   fields() {
      if (this.queryStr.fields) {
         const fields = (this.queryStr.fields as string).split(",").join(" ");
         this.query = this.query.select(fields);
      }
      return this;
   }
   pagination() {
      const page = +this.queryStr.page || 1;
      const limit = +this.queryStr.limit || 10;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      this.query = this.query.select("-__v -id");

      // if (this.queryStr.page) {
      //    const numTours = await this.query.countDocuments();
      //    if (skip > numTours) throw new Error("This page does not exist!");
      // }
      return this;
   }
}
