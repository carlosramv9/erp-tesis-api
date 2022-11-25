const User = require('./user');
const Customer = require('./customer');
const Property = require('./properties');
const Role = require('./role');
const Server = require('./server');
const TimeLine = require('./timeline');
const Document = require('./document');
const Builder = require('./builder');
const Division = require('./division');
const Category = require('./categories');
const ProcessTemplate = require('./processTemplate');
const Process = require('./process');
const Step = require('./step');
const Task = require('./task');
const Attachment = require('./attachment');
const Appointment = require('./appointment');
const Contract = require('./contract');
const BuildModel = require('./build_model');
const Contact = require('./contacts');
const BankCredit = require('./bankCredits');

(function populate() {
    Category.find().then(categories => {
        if (categories == 0) {
            new Category({ name: 'GRAVAMEN' }).save();
            new Category({ name: 'SERVICIOS' }).save();
            new Category({ name: 'REPARACIONES' }).save();
        }
    });
})();

module.exports = {
    User,
    Customer,
    Role,
    Server,
    TimeLine,
    Property,
    Document,
    Builder,
    Division,
    Category,
    ProcessTemplate,
    BuildModel,
    Process,
    Step,
    Task,
    Attachment,
    Appointment,
    Contract,
    Contact,
    BankCredit,
}