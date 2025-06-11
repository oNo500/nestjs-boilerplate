export const validatePasswordStrength = (password: string) => {
  // 1. 密码长度校验
  if (password.length < 8) {
    return false;
  }
  // TODO: 根据实际规则补全
  return true;
  // 2. 密码复杂度校验
  //   const regex =
  //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //   return regex.test(password);
};
