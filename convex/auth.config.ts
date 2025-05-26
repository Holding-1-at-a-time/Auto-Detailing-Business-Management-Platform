/**
    * @description      : 
    * @author           : rrome
    * @group            : 
    * @created          : 25/05/2025 - 18:24:36
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 25/05/2025
    * - Author          : rrome
    * - Modification    : 
**/

export default {
  providers: [
    {
      domain: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
      applicationID: "convex",
    },
  ]
};
