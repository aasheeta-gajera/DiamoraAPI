import jwt from 'jsonwebtoken'

const userAuth = async (req,res,next) => {
     const {token} = req.headers;

     if(!token){
        return res.json({sucess:false , message:"Not Authoroized. Login Again"})
     }

     try {
        const tokenDecode = jwt.verify(token ,'aasheeta#p')

        if(tokenDecode.id){
            req.body.userId = tokenDecode.id;  
        }else{
            return res.json({sucess:false , message:"Not Authoroized. Login Again"})
        }

        next();
     } catch (error) {
        console.log(error);
        res.json({sucess:false,message:error.message}) 
     }
}

export default userAuth;