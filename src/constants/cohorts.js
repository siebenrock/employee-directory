function getCohortOptions() {
  const cohortOptions = [];

  for (let year = new Date().getFullYear(); year >= 2011; year -= 1) {
    cohortOptions.push({
      value: year,
      label: year,
      children: [
        {
          value: "Spring",
          label: "Spring",
        },
        {
          value: "Fall",
          label: "Fall",
        },
      ],
    });
  }

  cohortOptions.push({
    value: 2010,
    label: 2010,
    children: [
      {
        value: "Spring",
        label: "Spring",
      },
      {
        value: "Summer",
        label: "Summer",
      },
      {
        value: "Fall",
        label: "Fall",
      },
      {
        value: "Winter",
        label: "Winter",
      },
    ],
  });

  cohortOptions.push({
    value: 2009,
    label: 2009,
    children: [
      {
        value: "Summer",
        label: "Summer",
      },
      {
        value: "Fall",
        label: "Fall",
      },
      {
        value: "Winter",
        label: "Winter",
      },
    ],
  });

  for (let year = 2008; year >= 2001; year -= 1) {
    cohortOptions.push({
      value: year,
      label: year,
      children: [
        {
          value: "Summer",
          label: "Summer",
        },
        {
          value: "Winter",
          label: "Winter",
        },
      ],
    });
  }

  return cohortOptions;
}

const cohorts = getCohortOptions();

export { cohorts as default };
