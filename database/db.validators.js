const { User, Role, PickRecord, Customer, Property, Builder, Division, Category, BankCredit, BuildModel, Bank, Investor, BankMovement, Process } = require('../models/index')
const { paramsError, entityExists } = require('config').get('message');
const { permissionList } = require('config')
    //Users
const emailValidation = async(email = '') => {
    const emailvalidation = await User.findOne({ email });
    if (emailvalidation) {
        throw new Error(`${entityExists.msg}`)
    }
};
const customerEmailValidation = async(email = '') => {
    const emailvalidation = await Customer.findOne({
        email
    });
    if (emailvalidation) {
        throw new Error(`${entityExists.msg}`)
    }
};
const userValidationById = async(id = '') => {
    const userValidation = await User.findById(id);
    if (!userValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};
//Roles
const uniqueRoleValidation = async(role = '') => {
    const rolValidation = await Role.findOne({ role });
    if (rolValidation) {
        throw new Error(`${entityExists.msg}`)
    }
};
const roleValidation = async(role = '') => {
    const rolValidation = await Role.findById(role);
    if (!rolValidation) throw new Error(`${paramsError.msg}`)
};

const roleRoutesValidation = async(routes = []) => {
    const validation = await routes.every(routes => permissionList.includes(routes));
    if (!validation) throw new Error(`${paramsError.msg}`)
};

const customerValidationById = async(id = '') => {
    const customerValidation = await Customer.findById(id);
    if (!customerValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};

const investorValidationById = async(id = '') => {
    const investorValidation = await Investor.findById(id);
    if (!investorValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};

const propertyValidationById = async(id = '') => {
    const propertyValidation = await Property.findById(id);
    if (!propertyValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};


const builderValidationById = async(id = '') => {
    const builderValidation = await Builder.findById(id);
    if (!builderValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};

const bankCreditValidationById = async(id = '') => {
    const bankCreditValidation = await BankCredit.findById(id);
    if (!bankCreditValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};

const divisionValidationById = async(id = '') => {
    const divisionValidation = await Division.findById(id);
    if (!divisionValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};

const categoryValidationById = async(id = '') => {
    const categoryValidation = await Category.findById(id);
    if (!categoryValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};

const buildModelValidationById = async(id = '') => {
    const categoryValidation = await BuildModel.findById(id);
    if (!categoryValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};

const bankValidationById = async(id = '') => {
    const bankValidation = await Bank.findById(id);
    if (!bankValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};

const bankMovementValidationById = async(id = '') => {
    const bankValidation = await BankMovement.findById(id);
    if (!bankValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};

const processValidationById = async(id = '') => {
    const processValidation = await Process.findById(id);
    if (!processValidation) {
        throw new Error(`${paramsError.msg}`)
    }
};


module.exports = {
    roleValidation,
    emailValidation,
    userValidationById,
    uniqueRoleValidation,
    roleRoutesValidation,
    customerValidationById,
    propertyValidationById,
    builderValidationById,
    divisionValidationById,
    categoryValidationById,
    customerEmailValidation,
    bankCreditValidationById,
    buildModelValidationById,
    bankValidationById,
    investorValidationById,
    bankMovementValidationById,
    processValidationById,
}