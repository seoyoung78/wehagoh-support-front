import production from './production';
import development from './development';
import local from './local';
import wehagov from './wehagov';
import ss from './ss';


const env = { production, development, local, wehagov, ss };

export default env[process.env.REACT_APP_DEPLOY_TYPE];

export const globals = require("global/" + process.env.REACT_APP_DEPLOY_TYPE);
