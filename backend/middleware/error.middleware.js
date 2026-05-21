// // middleware/errorMiddleware.js

// const notFound = (req, res, next) => {
//   const error = new Error(`Not Found - ${req.originalUrl}`);

//   res.status(404);

//   next(error);
// };

// const errorHandler = (err, req, res, next) => {
//   let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

//   let message = err.message;

//   // Mongoose bad ObjectId
//   if (err.name === 'CastError') {
//     statusCode = 404;
//     message = 'Resource not found';
//   }

//   // Only log in development
//   if (process.env.NODE_ENV === 'development') {
//     console.error(err);
//   }

//   res.status(statusCode).json({
//     message,
//     stack: process.env.NODE_ENV === 'development' ? err.stack : null,
//   });
// };

// export { notFound, errorHandler };

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
  });
};

export default errorMiddleware;
