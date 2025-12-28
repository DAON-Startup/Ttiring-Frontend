import React, { createContext, useContext, useState, ReactNode } from "react";

interface SignupData {
  name: string;
  email: string;
  studentId: string;
  department: string;
}

interface SignupContextType {
  signupData: SignupData;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setStudentId: (studentId: string) => void;
  setDepartment: (department: string) => void;
  clearSignupData: () => void;
}

const defaultSignupData: SignupData = {
  name: "",
  email: "",
  studentId: "",
  department: "",
};

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export function SignupProvider({ children }: { children: ReactNode }) {
  const [signupData, setSignupData] = useState<SignupData>(defaultSignupData);

  const setName = (name: string) => {
    setSignupData((prev) => ({ ...prev, name }));
  };

  const setEmail = (email: string) => {
    setSignupData((prev) => ({ ...prev, email }));
  };

  const setStudentId = (studentId: string) => {
    console.log("SignupContext - 학번 설정:", studentId);
    setSignupData((prev) => ({ ...prev, studentId }));
  };

  const setDepartment = (department: string) => {
    console.log("SignupContext - 학과 설정:", department);
    setSignupData((prev) => ({ ...prev, department }));
  };

  const clearSignupData = () => {
    setSignupData(defaultSignupData);
  };

  return (
    <SignupContext.Provider
      value={{
        signupData,
        setName,
        setEmail,
        setStudentId,
        setDepartment,
        clearSignupData,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error("useSignup must be used within a SignupProvider");
  }
  return context;
}
