import { BeatLoader } from "react-spinners";

export const LoadingVeiw = () => {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}>
      <div style = {{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}>
        <BeatLoader />
      </div>
    
    </div>
  );
};
