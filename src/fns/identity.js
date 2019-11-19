const identity = () => value => () => value;
identity.key = "identity";

module.exports = identity;
