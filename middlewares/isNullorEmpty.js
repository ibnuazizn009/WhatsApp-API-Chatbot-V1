const isNullOrEmpty = (val) => {
    return (
      val === "" ||
      val === undefined ||
      val === "undefined" ||
      val === " " ||
      val === null ||
      val === "null"
    );
  };
  
module.exports = isNullOrEmpty;
  