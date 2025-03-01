const asyncHandler = (requestHnadler) => {
  return (req, res, next) => {
    Promise.resolve(requestHnadler(req, res, next)).catch((err) => next(err));
  }
}



// const asyncHandler = (fn) => async (req,res,next) => {
//   try {

//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message
//     })
//   }
// }

export { asyncHandler }
