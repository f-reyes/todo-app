import { ErrorRequestHandler, RequestHandler } from "express";
import {
  AuthFailContextDoesntMatchRequest,
  AuthFailNoToken,
  AuthFailTokenWrongFormat,
  EmptyForm,
  LoginFail,
  RegisterFailOccupiedUsername,
  TodoDeleteFailIdNotFound,
  UserDeleteFailIdNotFound,
} from "./utils/error.ts";
import { Ctx, User } from "./utils/interfaces.ts";
import jwt from "jsonwebtoken";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.log(
    `->> ERROR-HANDLER - ${err.constructor.name} ${
      err.body ? "- " + JSON.stringify(err.body) : ""
    }\n`,
    `->> CLIENT-ERROR - ${err.clientError}\n`,
    `->> REQUEST-BODY - ${JSON.stringify(req.body)}\n`,
    `->> REQUEST-PATH - ${JSON.stringify(req.path)}`,
  );

  if (
    err instanceof TodoDeleteFailIdNotFound ||
    err instanceof UserDeleteFailIdNotFound || err instanceof EmptyForm
  ) {
    res.status(400).send(
      { "error": err.clientError },
    );
  } else if (
    err instanceof LoginFail || err instanceof AuthFailTokenWrongFormat ||
    err instanceof AuthFailNoToken
  ) {
    res.status(401).send({
      "error": err.clientError,
    });
  } else if (err instanceof AuthFailContextDoesntMatchRequest) {
    res.status(403).send({
      "error": err.clientError,
    });
  } else if (err instanceof RegisterFailOccupiedUsername) {
    res.status(409).send({ "error": err.clientError });
  } else {
    res.status(500).send({
      "error": "SERVICE ERROR",
    });
  }
};

export const logger: RequestHandler = (req, _res, next) => {
  console.log(
    `->> MIDDLEWARE - cookies - ${
      JSON.stringify(
        Object.keys(req.cookies).length === 0 ? "None" : req.cookies,
      )
    }`,
  );
  next();
};

export const checkToken: RequestHandler = (req, res, next) => {
  console.log(`->> MIDDLEWARE - auth`);
  const { authToken } = req.cookies;
  try {
    if (!authToken) {
      throw new AuthFailNoToken(null);
    }
    const user = jwt.verify(authToken, process.env.JWT_SECRET!);
    //FIXME: Find a way for this to not create a nested object "userInfo" in object "user". It is redundant.
    (res.locals as Ctx).userInfo = (user as User);
    next();
  } catch (err) {
    next(new AuthFailTokenWrongFormat(null));
  }
};
