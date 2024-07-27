/* eslint-disable @typescript-eslint/no-explicit-any */
import { IModel, IC } from "../types";
import { ApiFeatures } from "../util/ApiFeature";
import { HTTPException } from "hono/http-exception";

export const getAll = (model: IModel) => async (c: IC) => {
  let filter: object = {};
  if (c.req.param("tourId")) filter = { tour: c.req.param("tourId") };
  const feature = new ApiFeatures(model.find(filter))
    .filter(c.req.queries())
    .sort(c.req.query("sort"))
    .fields(c.req.query("fields"))
    .pagination(c.req.query("page"), c.req.query("limit"));
  const doc = await feature.query;
  return c.json(
    {
      status: "success",
      results: doc.length,
      data: {
        doc
      }
    },
    200
  );
};
export const getOne = (model: IModel, popOption?: any) => async (c: IC) => {
  try {
    let query;
    if (popOption) {
      query = model.findById(c.req.param("id")).populate(popOption);
    } else {
      query = model.findById(c.req.param("id"));
    }
    const doc = await query;

    if (!doc) {
      throw "no document found with this ID";
    }
    return c.json({
      status: "success",
      data: {
        doc
      }
    });
  } catch (error) {
    throw new HTTPException(401, { res: c.json({ error: error }) });
  }
};

export const delOne = (model: IModel) => async (c: IC) => {
  try {
    const docID = c.req.param("id");
    await model.findByIdAndDelete(docID);

    return c.json(
      {
        status: "success",
        data: null
      },
      204
    );
  } catch (error) {
    throw new HTTPException(401, { res: c.json({ error: error }) });
  }
};
