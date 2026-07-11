import bcrypt from "bcryptjs";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { ILoginUser, RegisterUserPayload } from "./auth.interface.js";
import { jwtUtils } from "../../utils/jwt.js";
import ApiError from "../../errors/ApiError.js";
import httpStatus from "http-status";
import { ActiveStatus } from "../../../generated/prisma/enums.js";

const registerUserIntoDB = async (payload: RegisterUserPayload) =>{
    const { name, email, password, role } = payload;
    const isUserExist = await prisma.user.findUnique({
        where: { email }
    })

    if (isUserExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds))

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role
        }
    });

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email
        },
        omit: {
            password: true
        }
    })

    return user;
}

const loginUser = async (payload : ILoginUser) => {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({
        where : {email}
    })

    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    if (user.activeStatus === ActiveStatus.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, "Your account has been blocked. Please contact support.");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken
    };
}

const refreshToken = async (refreshToken : string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret);

    if (!verifiedRefreshToken.success) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    const {id} = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where : {
            id
        }
    })

    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    if(user.activeStatus === "BLOCKED"){
        throw new ApiError(httpStatus.FORBIDDEN, "User is blocked!")
    }

    const jwtPayload = {
        id,
        name : user.name,
        email : user.email,
        role : user.role
    }


    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    return {accessToken}
}


export const authService = {
    registerUserIntoDB,
    loginUser,
    refreshToken
}