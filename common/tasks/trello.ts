/**
 * INFO: REST client for Trello's API
 */

/**
 * Based on https://github.com/norberteder/trello
 */
const minRequestDelay = 500;
const maxRequestDelay = 2000;

export interface TrelloRequest {
  key: string;
  token: string;
  name?: string;
  idOrganization?: string;
  desc?: string;
  actions?: string;
}

export interface TrelloBoard {
  name: string;
  desc: string;
  descData?: string;
  closed: boolean;
  dateClosed?: string;
  idOrganization: string;
  idEnterprise?: string;
  limits?: any;
  pinned?: any;
  shortLink: string;
  powerUps: string[];
  dateLastActivity: string;
  idTags: string[];
  datePluginDisable?: string;
  creationMethod?: string;
  ixUpdate?: string;
  enterpriseOwned: boolean;
  idBoardSource?: string;
  idMemberCreator: string;
  id: string;
  starred: boolean;
  url: string;
  prefs: {
    permissionLevel: string;
    hideVotes: boolean;
    voting: string;
    comments: string;
    invitations: string;
    selfJoin: boolean;
    cardCovers: boolean;
    isTemplate: boolean;
    cardAging: string;
    calendarFeedEnabled: boolean;
    background: string;
    backgroundImage: string;
    backgroundImageScaled: any;
    backgroundTile: boolean;
    backgroundBrightness: string;
    backgroundBottomColor: string;
    backgroundTopColor: string;
    canBePublic: boolean;
    canBeEnterprise: boolean;
    canBeOrg: boolean;
    canBePrivate: boolean;
    canInvite: boolean;
  };
  subscribed: boolean;
  labelNames: { [name: string]: string };
  dateLastView: string;
  shortUrl: string;
  templateGallery?: string;
  premiumFeatures: string[];
  memberships: any[];
}

export interface TrelloCard {
  id: string;
  checkItemStates?: string;
  closed: boolean;
  dateLastActivity: string;
  desc: string;
  descData?: string;
  dueReminder?: string;
  idBoard: string;
  idList: string;
  idMembersVoted: string[];
  idShort: number;
  idAttachmentCover?: string;
  idLabels: string[];
  manualCoverAttachment: boolean;
  name: string;
  pos: number;
  shortLink: string;
  isTemplate: boolean;
  cardRole?: string;
  badges?: any;
  dueComplete: boolean;
  due?: string;
  idChecklists: string[];
  idMembers: string[];
  labels: string[];
  shortUrl: string;
  start?: string;
  subscribed: boolean;
  url: string;
  cover?: any;
}

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  pos: number;
  softLimit?: any;
  idBoard: string;
  subscribed: boolean;
}

export enum RequestMethod {
  POST = "post",
  GET = "get",
  PUT = "put",
  DELETE = "delete",
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Trello {
  private key: string;
  private token: string;
  public static URI = "https://api.trello.com";

  constructor(key: string, token: string) {
    this.key = key;
    this.token = token;
  }

  createQuery(): TrelloRequest {
    return { key: this.key, token: this.token };
  }

  // addBoard(name: string, description: string, organizationId: string): Promise<Response> {
  //   const query = this.createQuery();
  //   query.name = name;

  //   if (description != null) query.desc = description;
  //   if (organizationId != null) query.idOrganization = organizationId;

  //   return makeRequest(
  //     RequestMethod.POST,
  //     Trello.URI + "/1/boards/",
  //     { query: query },
  //     callback
  //   );
  // }

  //   copyBoard(name: string, sourceBoardId: string, callback) {
  //     var query = this.createQuery();
  //     query.name = name;
  //     query.idBoardSource = sourceBoardId;

  //     return makeRequest(
  //       RequestMethod.POST,
  //       Trello.URI + "/1/boards/",
  //       { query: query },
  //       callback
  //     );
  //   }

  //   updateBoardPref(boardId, field, value, callback) {
  //     var query = this.createQuery();
  //     query.value = value;

  //     return makeRequest(
  //       RequestMethod.PUT,
  //       Trello.URI + "/1/boards/" + boardId + "/prefs/" + field,
  //       { query: query },
  //       callback
  //     );
  //   }

  //   addCard(name, description, listId, callback) {
  //     var query = this.createQuery();
  //     query.name = name;
  //     query.idList = listId;

  //     if (description !== null) query.desc = description;

  //     return makeRequest(
  //       RequestMethod.POST,
  //       Trello.URI + "/1/cards",
  //       { query: query },
  //       callback
  //     );
  //   }

  //   addCardWithExtraParams(name, extraParams, listId, callback) {
  //     var query = this.createQuery();
  //     query.name = name;
  //     query.idList = listId;

  //     Object.assign(query, extraParams);

  //     return makeRequest(
  //       RequestMethod.POST,
  //       Trello.URI + "/1/cards",
  //       { query: query },
  //       callback
  //     );
  //   }

  getCard(boardId: string | null, cardId: string): Promise<Response> {
    if (boardId == null) {
      return Trello.getRequest(
        `${Trello.URI}/1/cards/${cardId}`,
        this.createQuery()
      );
    } else {
      return Trello.getRequest(
        `${Trello.URI}/1/boards/${boardId}/cards/${cardId}`,
        this.createQuery()
      );
    }
  }

  async getCardsForList(
    listId: string,
    actions?: string
  ): Promise<TrelloCard[]> {
    const query = this.createQuery();
    if (actions != undefined) query.actions = actions;
    const response = await Trello.getRequest(
      `${Trello.URI}/1/lists/${listId}/cards`,
      query
    );
    return await response.json();
  }

  //   renameList(listId, name, callback) {
  //     var query = this.createQuery();
  //     query.value = name;

  //     return makeRequest(
  //       RequestMethod.PUT,
  //       Trello.URI + "/1/lists/" + listId + "/name",
  //       { query: query },
  //       callback
  //     );
  //   }

  //   addListToBoard(boardId, name, callback) {
  //     var query = this.createQuery();
  //     query.name = name;

  //     return makeRequest(
  //       RequestMethod.POST,
  //       Trello.URI + "/1/boards/" + boardId + "/lists",
  //       { query: query },
  //       callback
  //     );
  //   }

  //   addMemberToBoard(boardId, memberId, type, callback) {
  //     var query = this.createQuery();
  //     var data = { type: type }; // Valid Values: 'normal','admin','observer'

  //     return makeRequest(
  //       RequestMethod.PUT,
  //       Trello.URI + "/1/boards/" + boardId + "/members/" + memberId,
  //       { data: data, query: query },
  //       callback
  //     );
  //   }

  //   addCommentToCard(cardId, comment, callback) {
  //     var query = this.createQuery();
  //     query.text = comment;

  //     return makeRequest(
  //       RequestMethod.POST,
  //       Trello.URI + "/1/cards/" + cardId + "/actions/comments",
  //       { query: query },
  //       callback
  //     );
  //   }

  //   addAttachmentToCard(cardId, url, callback) {
  //     var query = this.createQuery();
  //     query.url = url;

  //     return makeRequest(
  //       RequestMethod.POST,
  //       Trello.URI + "/1/cards/" + cardId + "/attachments",
  //       { query: query },
  //       callback
  //     );
  //   }

  async getBoards(memberId: string): Promise<TrelloBoard[]> {
    const response = await Trello.getRequest(
      `${Trello.URI}/1/members/${memberId}/boards`,
      this.createQuery()
    );
    return await response.json();
  }

  getChecklistsOnCard(cardId: string): Promise<Response> {
    return Trello.getRequest(
      `${Trello.URI}/1/cards/${cardId}/checklists`,
      this.createQuery()
    );
  }

  getMember(memberId: string): Promise<Response> {
    return Trello.getRequest(
      `${Trello.URI}/1/member/${memberId}`,
      this.createQuery()
    );
  }

  async getMemberCards(memberId: string): Promise<TrelloCard[]> {
    const response = await Trello.getRequest(
      `${Trello.URI}/1/members/${memberId}/cards`,
      this.createQuery()
    );
    return await response.json();
  }

  async getListsOnBoard(boardId: string): Promise<TrelloList[]> {
    const response = await Trello.getRequest(
      `${Trello.URI}/1/boards/${boardId}/lists`,
      this.createQuery()
    );
    return await response.json();
  }

  async getCardsOnBoard(boardId: string): Promise<TrelloCard[]> {
    const response = await Trello.getRequest(
      `${Trello.URI}/1/boards/${boardId}/cards`,
      this.createQuery()
    );
    return await response.json();
  }

  private static objectToQuery(obj: any): string {
    return Object.keys(obj)
      .map((key) => key + "=" + obj[key])
      .join("&");
  }

  private static async getRequest(uri: string, query: any): Promise<Response> {
    const _ = await delay(
      Math.floor(Math.random() * (maxRequestDelay - minRequestDelay)) +
        minRequestDelay
    );
    return await fetch(`${uri}?${Trello.objectToQuery(query)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  }
}

// function makeRequest(fn, uri, options, callback) {
//   if (callback) {
//     var completeCallback = function (result, response) {
//       // in case we hit HTTP 429, delay requests by random timeout in between minRequestDelay and maxRequestDelay
//       // http://help.trello.com/article/838-api-rate-limits
//       if (response && response.statusCode === 429) {
//         setTimeout(() => {
//           fn(uri, options).once("complete", completeCallback);
//         }, Math.floor(Math.random() * (maxRequestDelay - minRequestDelay)) + minRequestDelay);
//       } else if (result instanceof Error) {
//         callback(result, null);
//       } else if (response != null && response.statusCode >= 400) {
//         const rv = new Error(result);
//         rv.response = response;
//         callback(rv, null);
//       } else {
//         callback(null, result);
//       }
//     };

//     fn(uri, options).once("complete", completeCallback);
//   } else {
//     return new Promise((resolve, reject) => {
//       var completeCallback = function (result, response) {
//         // in case we hit HTTP 429, delay requests by random timeout in between minRequestDelay and maxRequestDelay
//         // http://help.trello.com/article/838-api-rate-limits
//         if (response && response.statusCode === 429) {
//           setTimeout(() => {
//             fn(uri, options).once("complete", completeCallback);
//           }, Math.floor(Math.random() * (maxRequestDelay - minRequestDelay)) + minRequestDelay);
//         } else if (result instanceof Error) {
//           reject(result);
//         } else if (response != null && response.statusCode >= 400) {
//           const rv = new Error(result);
//           rv.response = response;
//           reject(rv);
//         } else {
//           resolve(result);
//         }
//       };

//       fn(uri, options).once("complete", completeCallback);
//     });
//   }
// }

// Trello.prototype.addMemberToCard = function (cardId, memberId, callback) {
//   var query = this.createQuery();
//   query.value = memberId;

//   return makeRequest(
//     rest.post,
//     this.uri + "/1/cards/" + cardId + "/members",
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.getOrgBoards = function (organizationId, callback) {
//   return makeRequest(
//     rest.get,
//     this.uri + "/1/organizations/" + organizationId + "/boards",
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.addChecklistToCard = function (cardId, name, callback) {
//   var query = this.createQuery();
//   query.name = name;

//   return makeRequest(
//     rest.post,
//     this.uri + "/1/cards/" + cardId + "/checklists",
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.addExistingChecklistToCard = function (
//   cardId,
//   checklistId,
//   callback
// ) {
//   var query = this.createQuery();
//   query.idChecklistSource = checklistId;

//   return makeRequest(
//     rest.post,
//     this.uri + "/1/cards/" + cardId + "/checklists",
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.addItemToChecklist = function (
//   checkListId,
//   name,
//   pos,
//   callback
// ) {
//   var query = this.createQuery();
//   query.name = name;
//   query.pos = pos;

//   return makeRequest(
//     rest.post,
//     this.uri + "/1/checklists/" + checkListId + "/checkitems",
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.updateCard = function (cardId, field, value, callback) {
//   var query = this.createQuery();
//   query.value = value;

//   return makeRequest(
//     rest.put,
//     this.uri + "/1/cards/" + cardId + "/" + field,
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.updateChecklist = function (
//   checklistId,
//   field,
//   value,
//   callback
// ) {
//   var query = this.createQuery();
//   query.value = value;

//   return makeRequest(
//     rest.put,
//     this.uri + "/1/checklists/" + checklistId + "/" + field,
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.updateCardName = function (cardId, name, callback) {
//   return this.updateCard(cardId, "name", name, callback);
// };

// Trello.prototype.updateCardDescription = function (
//   cardId,
//   description,
//   callback
// ) {
//   return this.updateCard(cardId, "desc", description, callback);
// };

// Trello.prototype.updateCardList = function (cardId, listId, callback) {
//   return this.updateCard(cardId, "idList", listId, callback);
// };

// Trello.prototype.getBoardMembers = function (boardId, callback) {
//   return makeRequest(
//     rest.get,
//     this.uri + "/1/boards/" + boardId + "/members",
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.getOrgMembers = function (organizationId, callback) {
//   return makeRequest(
//     rest.get,
//     this.uri + "/1/organizations/" + organizationId + "/members",
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.getListsOnBoardByFilter = function (
//   boardId,
//   filter,
//   callback
// ) {
//   var query = this.createQuery();
//   query.filter = filter;
//   return makeRequest(
//     rest.get,
//     this.uri + "/1/boards/" + boardId + "/lists",
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.getCardsOnBoardWithExtraParams = function (
//   boardId,
//   extraParams,
//   callback
// ) {
//   var query = this.createQuery();
//   Object.assign(query, extraParams);

//   return makeRequest(
//     rest.get,
//     this.uri + "/1/boards/" + boardId + "/cards",
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.getCardsOnList = function (listId, callback) {
//   return makeRequest(
//     rest.get,
//     this.uri + "/1/lists/" + listId + "/cards",
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.getCardsOnListWithExtraParams = function (
//   listId,
//   extraParams,
//   callback
// ) {
//   var query = this.createQuery();
//   Object.assign(query, extraParams);

//   return makeRequest(
//     rest.get,
//     this.uri + "/1/lists/" + listId + "/cards",
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.deleteCard = function (cardId, callback) {
//   return makeRequest(
//     rest.del,
//     this.uri + "/1/cards/" + cardId,
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.addWebhook = function (
//   description,
//   callbackUrl,
//   idModel,
//   callback
// ) {
//   var query = this.createQuery();
//   var data = {};

//   data.description = description;
//   data.callbackURL = callbackUrl;
//   data.idModel = idModel;

//   return makeRequest(
//     rest.post,
//     this.uri + "/1/tokens/" + this.token + "/webhooks/",
//     { data: data, query: query },
//     callback
//   );
// };

// Trello.prototype.deleteWebhook = function (webHookId, callback) {
//   var query = this.createQuery();

//   return makeRequest(
//     rest.del,
//     this.uri + "/1/webhooks/" + webHookId,
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.getLabelsForBoard = function (boardId, callback) {
//   return makeRequest(
//     rest.get,
//     this.uri + "/1/boards/" + boardId + "/labels",
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.getActionsOnBoard = function (boardId, callback) {
//   return makeRequest(
//     rest.get,
//     this.uri + "/1/boards/" + boardId + "/actions",
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.getCustomFieldsOnBoard = function (boardId, callback) {
//   return makeRequest(
//     rest.get,
//     this.uri + "/1/boards/" + boardId + "/customFields",
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.addLabelOnBoard = function (boardId, name, color, callback) {
//   var query = this.createQuery();
//   var data = {
//     idBoard: boardId,
//     color: color,
//     name: name,
//   };

//   return makeRequest(
//     rest.post,
//     this.uri + "/1/labels",
//     { data: data, query: query },
//     callback
//   );
// };

// Trello.prototype.deleteLabel = function (labelId, callback) {
//   return makeRequest(
//     rest.del,
//     this.uri + "/1/labels/" + labelId,
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.addLabelToCard = function (cardId, labelId, callback) {
//   var query = this.createQuery();
//   var data = { value: labelId };
//   return makeRequest(
//     rest.post,
//     this.uri + "/1/cards/" + cardId + "/idLabels",
//     { query: query, data: data },
//     callback
//   );
// };

// Trello.prototype.deleteLabelFromCard = function (cardId, labelId, callback) {
//   return makeRequest(
//     rest.del,
//     this.uri + "/1/cards/" + cardId + "/idLabels/" + labelId,
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.updateLabel = function (labelId, field, value, callback) {
//   var query = this.createQuery();
//   query.value = value;

//   return makeRequest(
//     rest.put,
//     this.uri + "/1/labels/" + labelId + "/" + field,
//     { query: query },
//     callback
//   );
// };

// Trello.prototype.updateLabelName = function (labelId, name, callback) {
//   return this.updateLabel(labelId, "name", name, callback);
// };

// Trello.prototype.updateLabelColor = function (labelId, color, callback) {
//   return this.updateLabel(labelId, "color", color, callback);
// };

// Trello.prototype.getCardStickers = function (cardId, callback) {
//   return makeRequest(
//     rest.get,
//     this.uri + "/1/cards/" + cardId + "/stickers",
//     { query: this.createQuery() },
//     callback
//   );
// };

// Trello.prototype.addStickerToCard = function (
//   cardId,
//   image,
//   left,
//   top,
//   zIndex,
//   rotate,
//   callback
// ) {
//   var query = this.createQuery();
//   var data = {
//     image: image,
//     top: top,
//     left: left,
//     zIndex: zIndex,
//     rotate: rotate,
//   };
//   return makeRequest(
//     rest.post,
//     this.uri + "/1/cards/" + cardId + "/stickers",
//     { query: query, data: data },
//     callback
//   );
// };

// Trello.prototype.addDueDateToCard = function (cardId, dateValue, callback) {
//   var query = this.createQuery();
//   query.value = dateValue;

//   return makeRequest(
//     rest.put,
//     this.uri + "/1/cards/" + cardId + "/due",
//     { query: query },
//     callback
//   );
// };

// module.exports = Trello;
