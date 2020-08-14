import React, { Component } from "react";
import { isMobileOnly } from "react-device-detect";

import {
  Layout,
  PageHeader,
  Row,
  Empty,
  Button,
  Drawer,
  Input,
  Icon,
  Spin,
  Radio,
  Cascader,
  Tooltip,
} from "antd";
import { Swipeable } from "react-swipeable";

import DirectoryFilter from "./Filter";
import DirectoryCard from "./Card";
import DirectoryProfile from "./Profile";

import * as OPTIONS from "../../constants/options";
import FIELDS from "../../constants/userFormFields";
import FILTERABLE from "../../constants/directory";
import COHORTS from "../../constants/cohorts";

import { withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";

import "./index.css";

const searchFieldOptions = [
  { label: "First Name", value: "firstName" },
  { label: "Last Name", value: "lastName" },
];

class Directory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      querySnapshot: null,
      queryLastKey: null,
      queryLimit: 50,
      queryType: "all",
      searchField: "firstName",
      profileDrawerOpen: false,
      currentProfile: null,
      filterOptions: null,
      filterCollapsed: false,
      mobileSearchCollapsed: true,
      mobileClassSelectCollapsed: true,
      mobileFavoritesCollapsed: true,
      favorites: props.authUser.favorites ? props.authUser.favorites : [],
      favoriteLoading: null,
    };
  }

  componentDidMount() {
    this.getUsers(false, "cohort");
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  static getDerivedStateFromProps() {
    const filterOptions = [];
    if (FILTERABLE) {
      FILTERABLE.forEach(key => {
        FIELDS.forEach(section => {
          section.fields.forEach(field => {
            if (field.value === key) {
              switch (field.type) {
                case "dropdown":
                case "radio":
                  filterOptions.push({
                    label: field.label,
                    value: field.value,
                    options: field.options,
                    isArraySearch: false,
                  });
                  break;
                case "tags":
                  filterOptions.push({
                    label: field.label,
                    value: field.value,
                    options:
                      field.optionPreset === "languages"
                        ? OPTIONS.languages
                        : field.options,
                    isArraySearch: true,
                  });
                  break;
                case "text":
                  filterOptions.push({
                    label: field.label,
                    value: field.value,
                    options: ["Fall 2018", "Spring 2019", "Fall 2019"],
                    isArraySearch: false,
                  });
                  break;
                default:
                  // if type is not specified, it will not be used as a filter
                  break;
              }
            }
          });
        });
      });
    }
    return { filterOptions };
  }

  getUsers = async (isLoadMore, queryType) => {
    const { firebase } = this.props;
    const {
      querySnapshot: currentQuerySnapshot,
      queryLastKey,
      queryLimit,
      searchField,
      searchTerm,
      filterKey,
      filterValue,
      filterIsArraySearch,
    } = this.state;

    this.setState({
      queryType,
      loading: !isLoadMore,
      loadingMore: isLoadMore,
    });

    let query = firebase.users();

    switch (queryType) {
      case "cohort":
        query = query.orderBy("parsedCohort", "desc").orderBy("firstName");
        break;
      case "search":
        if (searchTerm && searchField) {
          query = query
            .where(searchField, "==", searchTerm)
            .orderBy(searchField === "firstName" ? "lastName" : "firstName");
          break;
        }
      // Do not break if term and field are not set properly, continue with firstName
      // eslint-disable-next-line no-fallthrough
      case "firstName":
        query = query.orderBy("firstName");
        break;
      case "updated":
        query = query.orderBy("updatedAt", "desc");
        break;
      case "filter":
        query = query
          .where(
            filterKey,
            filterIsArraySearch ? "array-contains" : "==",
            filterValue,
          )
          .orderBy("firstName");
        break;
      default:
        console.error("Query type unknown");
        return;
    }

    if (isLoadMore) query = query.startAfter(queryLastKey);

    const querySnapshot = await query.limit(queryLimit).get();
    const querySnapshotData = querySnapshot.docs;

    this.setState({
      querySnapshot: isLoadMore
        ? [...currentQuerySnapshot, ...querySnapshotData]
        : querySnapshotData,
      queryLastKey:
        querySnapshot.docs.length === queryLimit
          ? querySnapshot.docs[querySnapshot.docs.length - 1]
          : null,
      loading: false,
      loadingMore: false,
    });
  };

  getFavorites = async () => {
    const { firebase } = this.props;
    const { favorites } = this.state;

    this.setState({
      queryType: "favorites",
      loading: true,
      loadingMore: false,
    });

    const allDocs = await Promise.all(
      favorites.map(id => firebase.user(id).get()),
    );

    allDocs.sort((a, b) => {
      const nameA = a.data().firstName.toUpperCase(); // ignore upper and lowercase
      const nameB = b.data().firstName.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    this.setState({
      querySnapshot: allDocs,
      queryLastKey: null,
      loading: false,
      loadingMore: false,
    });
  };

  onSearch = (field, term) => {
    const termCapitalized = term.charAt(0).toUpperCase() + term.slice(1);
    this.setState({ searchField: field, searchTerm: termCapitalized }, () =>
      this.getUsers(false, "search"),
    );
  };

  onFilter = (key, value, isArraySearch) => {
    this.setState(
      {
        filterKey: key,
        filterValue: value,
        filterIsArraySearch: isArraySearch,
      },
      () => {
        this.getUsers(false, "filter");
      },
    );
  };

  onChangeSearchField = e => {
    this.setState({
      searchField: e.target.value,
    });
  };

  openProfileDrawer = profileData => {
    if (profileData == null) return;
    this.setState({
      profileDrawerOpen: true,
      currentProfile: profileData,
    });

    const { firebase } = this.props;
    firebase.logEvent("directory_open_profile", {
      email: profileData.email,
      cohort: profileData.cohort,
    });
  };

  closeProfileDrawer = () => {
    this.setState({
      profileDrawerOpen: false,
    });
  };

  toggleFilter = () => {
    const { filterCollapsed } = this.state;
    this.setState({
      filterCollapsed: !filterCollapsed,
    });
  };

  toggleMobileFilter = type => {
    switch (type) {
      case "class":
        this.setState({
          mobileClassSelectCollapsed: false,
        });
        break;
      case "search":
        this.setState({
          mobileSearchCollapsed: false,
        });
        break;
      case "favorites":
        this.setState({
          mobileFavoritesCollapsed: false,
        });
        this.getFavorites();
        break;
      default:
        this.setState({
          mobileClassSelectCollapsed: true,
          mobileSearchCollapsed: true,
          mobileFavoritesCollapsed: true,
        });
        this.getUsers(false, "cohort");
        break;
    }
  };

  loadMore = () => {
    const { queryType, queryLastKey } = this.state;
    // All favorites are loaded at once, no need to load more
    if (queryLastKey && queryType !== "favorites")
      this.getUsers(true, queryType);
  };

  handleScroll = () => {
    const { loading, loadingMore } = this.state;
    const wrappedElement = document.getElementById("directory-feed");
    if (this.isBottom(wrappedElement) && !loading && !loadingMore) {
      // console.log("Bottom reached and currently not loading");
      this.loadMore();
    }
  };

  swipe = (event, isMobile) => {
    if (
      (isMobile &&
        event.dir === "Down" &&
        event.absY >= 140 &&
        event.velocity >= 1.5) ||
      (!isMobile &&
        event.dir === "Right" &&
        event.absX >= 160 &&
        event.velocity >= 1.5)
    ) {
      this.setState({
        profileDrawerOpen: false,
      });
    }
  };

  isBottom = element => {
    return element.getBoundingClientRect().bottom <= window.innerHeight;
  };

  changeFavorite = async id => {
    const { firebase } = this.props;
    const { favorites: oldFavorites } = this.state;

    this.setState({ favoriteLoading: id });

    let newFavorites;
    if (oldFavorites.includes(id))
      newFavorites = oldFavorites.filter(element => element !== id);
    else newFavorites = oldFavorites.concat([id]);

    await firebase
      .currentUser()
      .set({ favorites: newFavorites }, { merge: true });

    this.setState({ favorites: newFavorites, favoriteLoading: null });

    firebase.logEvent(
      oldFavorites.includes(id)
        ? "directory_remove_favorite"
        : "directory_add_favorite",
    );
  };

  render() {
    const {
      querySnapshot,
      queryLastKey,
      profileDrawerOpen,
      currentProfile: currentUserData,
      loading,
      loadingMore,
      filterOptions,
      filterCollapsed,
      mobileSearchCollapsed,
      mobileClassSelectCollapsed,
      mobileFavoritesCollapsed,
      searchField,
      favorites,
      favoriteLoading,
    } = this.state;
    const { windowWidth, authUser } = this.props;
    return (
      <Layout style={{ background: "transparent" }}>
        {!isMobileOnly && (
          <DirectoryFilter
            filterOptions={filterOptions}
            getByFirstName={() => this.getUsers(false, "firstName")}
            getByCohort={() => this.getUsers(false, "cohort")}
            getUpdated={() => this.getUsers(false, "updated")}
            getFilteredResults={(key, value, isArraySearch) =>
              this.onFilter(key, value, isArraySearch)
            }
            search={(field, term) => this.onSearch(field, term)}
            getFavorites={() => this.getFavorites()}
            searchFieldOptions={searchFieldOptions}
            collapsed={filterCollapsed}
          />
        )}
        <Layout
          className="module"
          style={{
            marginLeft: filterCollapsed || isMobileOnly ? "0" : "220px",
          }}
          id="directory-feed"
        >
          <PageHeader
            title="Directory"
            subTitle={!isMobileOnly && "Find and connect with Centerlings"}
            style={{ backgroundColor: "transparent" }}
            extra={
              <React.Fragment>
                {!isMobileOnly && (
                  <Tooltip
                    placement="left"
                    title={filterCollapsed ? "Show filter" : "Hide filter"}
                  >
                    <Button
                      icon={filterCollapsed ? "menu-unfold" : "menu-fold"}
                      onClick={this.toggleFilter}
                    />
                  </Tooltip>
                )}
                {isMobileOnly && (
                  <React.Fragment>
                    {mobileClassSelectCollapsed &&
                      mobileSearchCollapsed &&
                      mobileFavoritesCollapsed && (
                        <React.Fragment>
                          <Button
                            icon={mobileClassSelectCollapsed ? "star" : "close"}
                            onClick={() => this.toggleMobileFilter("favorites")}
                            shape="circle"
                          />
                          <Button
                            icon={
                              mobileClassSelectCollapsed ? "table" : "close"
                            }
                            onClick={() => this.toggleMobileFilter("class")}
                            shape="circle"
                          />
                          <Button
                            icon={mobileSearchCollapsed ? "search" : "close"}
                            onClick={() => this.toggleMobileFilter("search")}
                            shape="circle"
                          />
                        </React.Fragment>
                      )}
                    {(!mobileClassSelectCollapsed ||
                      !mobileSearchCollapsed ||
                      !mobileFavoritesCollapsed) && (
                      <Button
                        icon="close"
                        onClick={() => this.toggleMobileFilter()}
                        shape="circle"
                      />
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            }
          >
            {!mobileSearchCollapsed && (
              <React.Fragment>
                <Input.Search
                  autoFocus
                  enterButton
                  onSearch={term => this.onSearch(searchField, term)}
                  style={{ marginBottom: "8px" }}
                  allowClear
                  inputMode="search"
                />
                <Radio.Group
                  options={searchFieldOptions}
                  onChange={this.onChangeSearchField}
                  value={searchField}
                />
              </React.Fragment>
            )}
            {!mobileClassSelectCollapsed && (
              <React.Fragment>
                <Cascader
                  options={COHORTS}
                  onChange={selected =>
                    this.onFilter(
                      "cohort",
                      `${selected[1]} ${selected[0]}`,
                      false,
                    )
                  }
                  style={{ width: "100%" }}
                  placeholder="Class"
                />
              </React.Fragment>
            )}
          </PageHeader>

          <Layout className="module-thin-sides">
            <Row gutter={{ xs: 4, sm: 6, md: 6, lg: 6 }}>
              {!loading &&
                (querySnapshot
                  ? querySnapshot.map(queryDocumentSnapshot => (
                      <DirectoryCard
                        userSnapshot={queryDocumentSnapshot}
                        key={queryDocumentSnapshot.id}
                        onCardClick={this.openProfileDrawer}
                        isFavorite={
                          favorites &&
                          favorites.includes(queryDocumentSnapshot.id)
                        }
                        changeFavorite={() =>
                          this.changeFavorite(queryDocumentSnapshot.id)
                        }
                        favoriteLoading={favoriteLoading}
                      />
                    ))
                  : !loading && !loadingMore && <Empty />)}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  paddingTop: "30px",
                  paddingBottom: "66px",
                }}
              >
                {loading || loadingMore ? (
                  <Spin
                    indicator={<Icon type="loading-3-quarters" spin />}
                    style={{ marginTop: "30px" }}
                  />
                ) : (
                  queryLastKey && (
                    <Button
                      shape="round"
                      icon="caret-down"
                      onClick={() => this.loadMore()}
                    >
                      Load More
                    </Button>
                  )
                )}
              </div>
            </Row>
          </Layout>
        </Layout>
        <Drawer
          placement={isMobileOnly ? "bottom" : "right"}
          visible={profileDrawerOpen}
          onClose={this.closeProfileDrawer}
          closable
          destroyOnClose
          width={Math.min(windowWidth * 0.618, 650)}
          height="85%"
        >
          <Swipeable onSwiped={event => this.swipe(event, isMobileOnly)}>
            <DirectoryProfile
              userData={currentUserData}
              authUserEmail={authUser.email}
            />
          </Swipeable>
        </Drawer>
      </Layout>
    );
  }
}

const condition = authUser => authUser != null;

export default withFirebase(withAuthorization(condition)(Directory));
